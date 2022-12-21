const fetch = require('node-fetch')
const xml2js = require('xml2js')
const admin = require('firebase-admin')
const service_account = require('./service_account.json')

admin.initializeApp({
    credential: admin.credential.cert(service_account)
});
const db = admin.firestore();
const parser = xml2js.Parser();

/**
 * @returns Serialnumbers and distances of drones inside no-fly-zone
 */
async function getDrones(){
    return fetch('http://assignments.reaktor.com/birdnest/drones')
        .then(result => result.text())
        .then(result => parser.parseStringPromise(result))
        .then(result => {
            JSON.stringify(result)
            let drones = result.report.capture[0].drone; // List of drone objects
            
            // Filter drones that are inside no-fly-zone of 100 meters
            let filtered = drones.filter(drone => {
                let distance = calculateDistance(drone); 
                if (distance < 100000){
                    return drone
                }
            })
            // List of tuples containing drone serialnumber and distance to the nest
            let tuples = filtered.map(drone => [drone.serialNumber[0], calculateDistance(drone)]);   
            return tuples;
        })
}

/**
 * 
 * @param {[[string, number]]} droneData List of tuples where first item is serialnumber and second distance to the nest
 * @returns List of objects containing owner data, distance and detection time
 */
async function getPilots(droneData){

    let pilotURLs = []; 
    for (let i = 0; i < droneData.length; i++){  
        // Add tuple containing url and distance to the list
        pilotURLs.push([`http://assignments.reaktor.com/birdnest/pilots/${droneData[i][0]}`, droneData[i][1]]);     
    }  
    
    let pilotData = [];
    await Promise.all(pilotURLs.map((item) => fetch(item[0])
        .then(response => response.text())
        .then(result => JSON.parse(result))
        .then(async function(result){
            result['timeDetected'] = new Date().getTime(); // Add time when detected to the data
            result['distance'] = item[1] // Add distance to the data
            pilotData.push(result)
        })
    ))
    return pilotData  
}

/**
 * Send data to firestore
 * @param {*} pilots Data to be send
 */

async function sendToFirestore(pilots){
    for (let i = 0; i < pilots.length; i++){
        // Check if pilot already is in database
        let pilot = pilots[i]
        const query = await db.collection('pilots').where("pilotId", "==" , pilot.pilotId).get();
       
        // if doesnt exist in database add pilot there
        if (query.docs.length == 0){
            const res = await db.collection('pilots').add(pilot);
            console.log(pilot.firstName, pilot.lastName,' added with document id: ' + res.id)
        }
        // if exists replace with new doc with new distance
        // or update time detected
        else{
            let queryPilot = query.docs[0].data(); // Query result is list containing one object 
            if(queryPilot.distance > pilot.distance){
                const del = await query.docs[0].ref.delete();
                const res = await db.collection('pilots').add(pilot);
                console.log(`${pilot.firstName} ${pilot.lastName} distance updated from ${queryPilot.distance} to ${pilot.distance}`)
            }
            else{
                // Update latest time detected
                const pilotRef = query.docs[0].ref;
                const update = await pilotRef.update({timeDetected: new Date().getTime()})
                let data = query.docs[0].data()
                console.log('New latest time detected for ' + data.firstName, data.lastName)
            }
        }
    }
}

async function removeOld(){
    // Time 10 minutes ago
    let time = new Date().getTime() - 600000;
    // Get docs that are older than 10 minutes
    let pilotsToRemove = await db.collection('pilots').where("timeDetected", "<", time).get();
    
    // Remove pilots
    await Promise.all(pilotsToRemove.docs.map(doc => {
        let data = doc.data()
        console.log('Removing ' + data.firstName, data.lastName)
        doc.ref.delete()}));
}

function calculateDistance(drone){
    let x1 = parseInt(drone.positionX[0]);
    let y1 = parseInt(drone.positionY[0]);
    let x0 = 250000;
    let y0 = 250000;
    let r = 100000;
    let distance = Math.abs(Math.sqrt((x1 - x0)**2 + (y1 - y0)**2));
    return distance
}


async function main(){
    let drones = await getDrones();
    let pilots = await getPilots(drones);
    await sendToFirestore(pilots);
    await removeOld();
}

setInterval((async () => {
    main();
}), 2000)