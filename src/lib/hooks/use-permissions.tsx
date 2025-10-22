// import * as Location from 'expo-location';
// import { useCallback, useEffect, useState } from 'react';

// import { setUserLocation } from '../auth/utils';

// interface PermissionStatus {
//   location: boolean;
// }

// export const usePermissions = () => {
//   const [permissions, setPermissions] = useState<PermissionStatus>({
//     location: false,
//   });

//   const updateUserLocation = useCallback(async () => {
//     try {
//       const locationStatus = await Location.requestForegroundPermissionsAsync();
//       if (locationStatus.status !== 'granted') {
//         return;
//       }

//       const currentLocation = await Location.getCurrentPositionAsync({
//         accuracy: Location.Accuracy.Highest,
//       });

//       const addressResponse = await Location.reverseGeocodeAsync({
//         latitude: currentLocation.coords.latitude,
//         longitude: currentLocation.coords.longitude,
//       });

//       const addressInfo = addressResponse[0];
//       setUserLocation({
//         latitude: currentLocation.coords.latitude,
//         longitude: currentLocation.coords.longitude,
//         address: addressInfo?.formattedAddress ?? '',
//         city: addressInfo?.city ?? '',
//         state: addressInfo?.region ?? '',
//         country: addressInfo?.country ?? '',
//         postalCode: addressInfo?.postalCode ?? '',
//         street: addressInfo?.street ?? '',
//         region: addressInfo?.region ?? '',
//         subregion: addressInfo?.subregion ?? '',
//         streetNumber: addressInfo?.streetNumber ?? '',
//       });
//     } catch (error) {
//       console.error('Error updating location:', error);
//     }
//   }, []);

//   const requestPermissions = useCallback(async () => {
//     try {
//       const locationStatus = await Location.requestForegroundPermissionsAsync();

//       setPermissions({
//         location: locationStatus.status === 'granted',
//       });
//     } catch (error) {
//       console.error('Error requesting permissions:', error);
//     }
//   }, []);

//   useEffect(() => {
//     requestPermissions();
//   }, [requestPermissions]);

//   useEffect(() => {
//     updateUserLocation();
//   }, [updateUserLocation]);

//   return {
//     permissions,
//     requestPermissions,
//     updateUserLocation,
//   };
// };
