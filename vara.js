async function getDrones(){
    fetch('http://assignments.reaktor.com/birdnest/drones')
        .then(result => result.text())
        .then(result => {
            const parsedSerial = parser.parseString(result, function(e, result){
                // Handle parsed result
                JSON.stringify(result)
                let drones = result.report.capture[0].drone // List of drone objects
                
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
                // console.log(serials)
                return serials;
            })
            return parsedSerial 
        }) 
        .then(res => console.log(res))
}

async function updateDatabase(){
    fetch('http://assignments.reaktor.com/birdnest/drones')
        .then(result => result.text())
        .then(result => {
            parser.parseString(result, function(e, result){
                // Handle parsed result
                JSON.stringify(result)
                let drones = result.report.capture[0].drone // List of drone objects
                let serials = drones.map(drone => drone.serialNumber[0]) // List of drone serialnumbers
                let urls = [] 
                for (let i = 0; i < serials.length; i++){
                    urls.push(`http://assignments.reaktor.com/birdnest/pilots/${serials[i]}`); //Create array of promises       
                }    
                let droneDataToDb = [] 
                Promise.all(urls.map(url => fetch(url)
                    .then(response => response.text())
                    .then(result => JSON.parse(result))
                    .then(result => {
                        result['timeDetected'] = new Date().getTime(); // Add time when detected to the data
                        console.log(result)
                        addDoc(collection(db, "pilots"), result);
        
                    })
        
                ))  
             
                      
            })
        })   
}
