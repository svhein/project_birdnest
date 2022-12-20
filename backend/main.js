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
 * @returns Serialnumbers of drones inside no-fly-zone
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
                let x_coordinate = parseInt(drone.positionX[0]);
                let y_coordinate = parseInt(drone.positionY[0]);
                let distance = calculateDistance(x_coordinate, y_coordinate); 
                if (distance < 100000){
                    return drone
                }
            })
            let serials = filtered.map(drone => drone.serialNumber[0]); // List of drone serialnumbers  
            return serials;
        })
}

async function getPilots(serialNumbers){
    let serials = serialNumbers;
    let urls = [];
    let pilots = [];
    for (let i = 0; i < serials.length; i++){
    urls.push(`http://assignments.reaktor.com/birdnest/pilots/${serials[i]}`); //Create array of promises       
        }  
    await Promise.all(urls.map(url => fetch(url)
        .then(response => response.text())
        .then(result => JSON.parse(result))
        .then(async function(result){
            result['timeDetected'] = new Date().getTime(); // Add time when detected to the data
            pilots.push(result)
        })
    ))
    return pilots   
}

async function sendToFirestore(pilots){
    for (let i = 0; i < pilots.length; i++){
        // Check if pilot already is in database
        let pilot = pilots[i]
        const query = await db.collection('pilots').where("pilotId", "==" , pilot.pilotId).get();
        // if doesnt exist in database add pilot there
        if (query.docs.length == 0){
            const res = await db.collection('pilots').add(pilot);
            console.log('Pilot added with document id: ' + res.id)
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
        console.log('Removing ' + doc.id)
        doc.ref.delete()}));
}

function calculateDistance(x, y){
    let x0 = 250000;
    let y0 = 250000;
    let r = 100000;
    let distance = Math.abs(Math.sqrt((x - x0)**2 + (y - y0)**2));
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