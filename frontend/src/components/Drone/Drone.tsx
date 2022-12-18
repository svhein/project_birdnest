import React, {FC} from 'react'

type DroneProps = {
    pilotId: string,
    firstName: string,
    lastName: string,
    phoneNumber: string,
    createDt: string,
    email: string
  }

const Drone:FC<DroneProps> = (props: DroneProps) => {
        
    return (<tr>
                <td>{props.firstName} {props.lastName}</td>
                <td>{props.email}</td>
                <td>{props.phoneNumber}</td>
                <td>time</td>
            </tr>)
} 

export default Drone;