My pre-assignment solution to Reaktor Developer Trainee 2023 application.

# Project Birdnest

[birdnest-d418e.firebaseapp.com](birdnest-d418e.firebaseapp.com)

## Objective
**Build and deploy a web application which lists all the pilots who recently violated the No-Drone-Zone perimeter of 100 meters.**

- Persist the pilot information for 10 minutes since their drone was last seen by the equipment
- Display the closest confirmed distance to the nest
- Contain the pilot name, email address and phone number
- Immediately show the information from the last 10 minutes to anyone opening the application
- Not require the user to manually refresh the view to see up-to-date information

[A drones position endpoint](assignments.reaktor.com/birdnest/drones) updates every 2 seconds and it provides snapshot of drones within 500 x 500 meters of the monitoring equipment:
```xml
<report>
   <deviceInformation deviceId="GUARDB1RD">
      <listenRange>500000</listenRange>
      <deviceStarted>2023-01-06T15:15:33.955Z</deviceStarted>
      <uptimeSeconds>24332</uptimeSeconds>
      <updateIntervalMs>2000</updateIntervalMs>
   </deviceInformation>
   <capture snapshotTimestamp="2023-01-06T22:01:06.310Z">
      <drone>
         <serialNumber>SN-XQmIZ9TkfZ</serialNumber>
         <model>Altitude X</model>
         <manufacturer>DroneGoat Inc</manufacturer>
         <mac>52:1b:68:81:67:81</mac>
         <ipv4>36.237.12.223</ipv4>
         <ipv6>8f3f:1967:ad45:9554:27c2:c008:17da:b307</ipv6>
         <firmware>8.3.0</firmware>
         <positionY>336690.05695740774</positionY>
         <positionX>182858.39492092314</positionX>
         <altitude>4896.413551927535</altitude>
      </drone>
      <drone>
         <serialNumber>SN-7WDh76bpoP</serialNumber>
         <model>HRP-DRP 1</model>
         <manufacturer>ProDröne Ltd</manufacturer>
         <mac>25:9a:06:d5:7c:4d</mac>
         <ipv4>125.175.1.236</ipv4>
         <ipv6>f78f:e114:c4b7:a295:47fc:9da9:a3d7:b4c7</ipv6>
         <firmware>7.1.6</firmware>
         <positionY>234410.52826533286</positionY>
         <positionX>224269.55527006657</positionX>
         <altitude>4415.516523163438</altitude>
      </drone>
      <drone>
         <serialNumber>SN-3ajS7qieL8</serialNumber>
         <model>Altitude X</model>
         <manufacturer>DroneGoat Inc</manufacturer>
         <mac>d2:31:36:06:24:9c</mac>
         <ipv4>75.169.63.31</ipv4>
         <ipv6>e86c:4ea7:f252:d561:f730:85b3:46cd:062e</ipv6>
         <firmware>4.2.6</firmware>
         <positionY>294587.5102233427</positionY>
         <positionX>367748.866481174</positionX>
         <altitude>4045.9359311028265</altitude>
      </drone>
      <drone>
         <serialNumber>SN-eVmvfKsoDN</serialNumber>
         <model>Mosquito</model>
         <manufacturer>MegaBuzzer Corp</manufacturer>
         <mac>54:fe:b0:16:20:25</mac>
         <ipv4>188.100.204.151</ipv4>
         <ipv6>ecf5:70bf:023d:f8e3:5106:9ab2:2dd1:bb78</ipv6>
         <firmware>4.1.8</firmware>
         <positionY>90041.14673598754</positionY>
         <positionX>319903.1428953393</positionX>
         <altitude>4100.153859818656</altitude>
      </drone>
      <drone>
         <serialNumber>SN-5t6zz_21VJ</serialNumber>
         <model>HRP-DRP 1 Max</model>
         <manufacturer>ProDröne Ltd</manufacturer>
         <mac>f8:85:83:9b:0f:a4</mac>
         <ipv4>198.162.65.27</ipv4>
         <ipv6>42d6:e998:82b1:bc89:bc7c:7f9b:5cf3:172f</ipv6>
         <firmware>9.5.7</firmware>
         <positionY>199554.70441949592</positionY>
         <positionX>456667.6438932379</positionX>
         <altitude>4258.424200251769</altitude>
      </drone>
   </capture>
</report>
``` 

Pilot endpoint at [assignments.reaktor.com/birdnest/pilots/:serialNumber](assignments.reaktor.com/birdnest/pilots/:serialNumber) provide JSON about pilot by drone serialnumber:
```json
{
   "pilotId":"P-2BGDCD-I_K",
   "firstName":"Parker",
   "lastName":"Gusikowski",
   "phoneNumber":"+210509320288",
   "createdDt":"2022-01-15T21:06:05.019Z",
   "email":"parker.gusikowski@example.com"
}
```
## Solution

My solution contains

- node.js app that fetches data from endpoints and updates database, running as google cloud compute engine instance
- database (Firebase Firestore)
- React app that listens the database changes.

### Node.js app in nutshell:

1. Fetch data from drones api
2. Filter drones that are inside the no-drone-zone
3. Fetch pilots by the drone serialnumbers
4. Add pilots to database
5. Remove pilots which haven't been detected for 10 minutes
6. Loop steps 1 - 5 every 2 seconds


## Licence
### Apache 2.0 License
[![License](https://img.shields.io/badge/License-Apache_2.0-blue.svg)](https://opensource.org/licenses/Apache-2.0)


