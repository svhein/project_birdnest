import { React, useEffect, useState} from 'react';
import {db} from '../../firebaseConfig.js'
import { collection, query, where, onSnapshot } from "firebase/firestore";

function Table(props){

    const [pilots, setPilots] = useState([])

    useEffect(() => {
        console.log('useffect')
        let q = query(collection(db, 'pilots'));
        onSnapshot(q, (snapShot) => {
            let pilotsResult = [];
            snapShot.docs.map(doc => pilotsResult.push(doc.data()));
            setPilots(pilotsResult);
        })
    },[])

    return (
        <table>
            <tr>
                <th>Distance</th>
                <th>Name</th>
                <th>Email</th>
                <th>Phone</th>
            </tr>
        </table>
        )
}

export default Table;