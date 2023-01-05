import { React, useEffect, useState} from 'react';
import {db} from '../../firebaseConfig.js'
import { collection, query, onSnapshot } from "firebase/firestore";

function Table(props){

    const [pilots, setPilots] = useState([])
    const [sortBy, setSortBy] = useState("timeDetected")

    useEffect(() => {
        let q = query(collection(db, 'pilots'));
        const unsub = onSnapshot(q, (snapShot) => {
            let pilotsSnap = snapShot.docs.map(doc => doc.data());
            console.log(pilotsSnap)
            // sort by chosen parameter
            pilotsSnap.sort(function(a,b){
                switch (sortBy){
                    case 'timeDetected':
                        return b[sortBy] - a[sortBy];
                    case 'distance':
                        return a[sortBy] - b[sortBy];
                    case 'firstName':
                    case 'lastName':
                        return a[sortBy].localeCompare(b[sortBy])
                }
            });
            setPilots(pilotsSnap);
        })
        return unsub;
    },[sortBy])

    function onHeaderClick(value){
        setSortBy(value)
    }

    let rows = pilots.map(pilot => {
        let time = (new Date().getTime() - pilot.timeDetected) / 1000;
        let minutes = Math.round(time/60)
        let distance = Math.round(pilot.distance / 1000)

        return (
            <tr key={pilot.pilotId}>
                <td>{distance} meters</td>
                <td>{pilot.firstName}</td>
                <td>{pilot.lastName}</td>
                <td>{pilot.email}</td>
                <td>{pilot.phoneNumber}</td>
                <td>{minutes} minutes ago</td>
             </tr>
        )
    })

    return (
        <table>
            <tr>
                <th id='sortable' onClick={() => onHeaderClick('distance')}>Closest Distance</th>
                <th id='sortable' onClick={() => onHeaderClick('firstName')}>Firstname</th>
                <th id='sortable' onClick={() => onHeaderClick('lastName')}>Lastname</th>
                <th>Email</th>
                <th>Phone</th>
                <th id='sortable' onClick={() => onHeaderClick('timeDetected')}>Time</th>
            </tr>
            {/* <DataRows /> */}
            {rows}
        </table>
        )
}

export default Table;