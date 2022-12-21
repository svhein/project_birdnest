import { React, useEffect, useState} from 'react';
import {db} from '../../firebaseConfig.js'
import { collection, query, onSnapshot } from "firebase/firestore";

function Table(props){

    const [pilots, setPilots] = useState([])

    useEffect(() => {
        console.log('useffect')
        let q = query(collection(db, 'pilots'));
        onSnapshot(q, (snapShot) => {
            let pilotsResult = [];
            snapShot.docs.map(doc => pilotsResult.push(doc.data()));

            // sort by timeDetected
            pilotsResult.sort(function(a,b){
                return b.timeDetected - a.timeDetected
            })
            setPilots(pilotsResult);
        })
    },[])

    useEffect(() => {
        console.log(pilots)
    },[pilots])

    function DataRows(){
        let rows = [];
        pilots.map(pilot => {

            let time = (new Date().getTime() - pilot.timeDetected) / 1000;
            let minutes = Math.round(time/60)
            let distance = Math.round(pilot.distance / 1000)

            rows.push(
                <tr>
                    <td>{distance} meters</td>
                    <td>{pilot.lastName}</td>
                    <td>{pilot.email}</td>
                    <td>{pilot.phoneNumber}</td>
                    <td>{minutes} minutes ago</td>
                </tr>
            )
        })
        return rows;
    }

    return (
        <table>
            <tr>
                <th>Closest Distance</th>
                <th>Name</th>
                <th>Email</th>
                <th>Phone</th>
                <th>Time</th>
            </tr>
            <DataRows />
        </table>
        )
}

export default Table;