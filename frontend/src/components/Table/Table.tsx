import React, {FC, useState, useEffect} from 'react'
import Drone from '../Drone/Drone';

const Table:FC<{}> = () => {

    const [drones, setDrones] = useState<typeof Drone[]>([])

    useEffect(() => {
        setTimeout(() => {
            let req = new XMLHttpRequest();
            req.open('GET', 'http://assignments.reaktor.com/birdnest/drones');
            req.send();
            let parser = new DOMParser();
            req.onload = function(){
                console.log(this.responseText)
            }
        }, 2000)
        
    }, [])

    return(null);

}

export default Table;
