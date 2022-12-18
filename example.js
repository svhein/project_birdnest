function fetchDrones(){
    fetch('http://assignments.reaktor.com/birdnest/drones')
        .then(result => result.text())
        .then(result => {
            parser.parseString(result, function(e, result){
                let result_json = JSON.stringify(result)
                let drones = result.report.capture[0].drone // List of drone objects
                let serials = drones.map(drone => drone.serialNumber[0]) // List of drone serialnumbers
                console.log(serials.length)
                for (let i = 0; i < serials.length; i++){
                    console.log(serials[i])
                    fetch(`http://assignments.reaktor.com/birdnest/pilots/${serials[i]}`)
                        .then(result => result.text())
                        .then(result => JSON.parse(result))
                        .then(result => {
                            result['timeDetected'] = new Date().getTime(); // Add time when detected to the data
                            addDoc(collection(db, "pilots"), result) // Send data to firestore
                        })
                }               
            })
        })   
}.then(response => {
    return new Promise((resolve, reject) => {
        parser.parseString(response, (err, result) => {
            if (err) {
                reject(err);
            } else {
                resolve(result);
            }
        });
    });