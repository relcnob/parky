/* eslint-disable @typescript-eslint/no-unsafe-argument */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import React, { useEffect } from "react";
import { MapContainer, Marker, Pane, Popup, TileLayer } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet";
import { useMap, Circle } from "react-leaflet";
import { type OSMdata } from "./utils";
import { type RouterOutputs } from "~/utils/api";
import styles from "./MapComponent.module.scss";
import { useUser } from "@clerk/nextjs";
import { LoaderIcon } from "react-hot-toast";

const pinIconBlue = L.icon({
  iconSize: [36, 36],
  iconUrl: "./icon/map-pin-blue.svg",
  shadowSize: [32, 32],
  shadowAnchor: [15, 10],
  shadowUrl: "./icon/icon_shadow.png",
});

const pinIconRed = L.icon({
  iconSize: [36, 36],
  iconUrl: "./icon/map-pin-red.svg",
  shadowSize: [32, 32],
  shadowAnchor: [15, 10],
  shadowUrl: "./icon/icon_shadow.png",
});

const pinIconGray = L.icon({
  iconSize: [36, 36],
  iconUrl: "./icon/map-pin-gray.svg",
});

const pinIconYellow = L.icon({
  iconSize: [36, 36],
  iconUrl: "./icon/map-pin-yellow.svg",
  shadowSize: [32, 32],
  shadowAnchor: [15, 10],
  shadowUrl: "./icon/icon_shadow.png",
});

type MapProps = {
  location?: OSMdata;
  nearbyParkingSpots: RouterOutputs["parking"]["getParkingWithinRange"];
  spotSelection: (spotId: string) => void;
  userData: any;
  isUserLoading: boolean;
  activeSpot: string;
};

type ResetViewProps = {
  selectPosition: OSMdata | undefined;
};

const MapComponent = ({
  location,
  nearbyParkingSpots,
  spotSelection,
  userData,
  isUserLoading,
  activeSpot,
}: MapProps) => {
  function ResetView({ selectPosition }: ResetViewProps) {
    const map = useMap();

    useEffect(() => {
      if (selectPosition) {
        map.setView(
          L.latLng(
            parseFloat(selectPosition?.lat),
            parseFloat(selectPosition?.lon)
          ),
          map.getZoom(),
          {
            animate: true,
          }
        );
      }
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [selectPosition]);
    return null;
  }

  const user = useUser();
  const fillBlueOptions = {
    fillColor: "#1b31a4",
    dashArray: "10, 10",
    dashOffset: "10",
    fillOpacity: 0.2,
  };

  const checkForSize = (parkingSize: string, userCarSize: string) => {
    const sizeArray = ["XSMALL", "SMALL", "MEDIUM", "LARGE", "XLARGE"];
    const parkingIndex = sizeArray.indexOf(parkingSize);
    const userIndex = sizeArray.indexOf(userCarSize);

    if (parkingIndex >= userIndex) {
      return true;
    } else {
      return false;
    }
  };

  return (
    <MapContainer
      center={[55.6867243, 12.5700724]}
      zoom={13}
      style={{ width: "100%", height: "100%" }}
    >
      {isUserLoading && (
        <section className={styles.loaderWrapper}>
          <div>
            Loading user data <LoaderIcon />
          </div>
        </section>
      )}
      <TileLayer
        attribution='&copy; <a href="http://osm.org/copyright">OpenStreetMap</a> contributors'
        url="https://api.maptiler.com/maps/basic-v2/{z}/{x}/{y}.png?key=pSdO0p7aotEmiB0g4S3q"
        tileSize={512}
        zoomOffset={-1}
      />
      {location?.lat && location?.lon ? (
        <>
          {/* <Marker
            position={[parseFloat(location.lat), parseFloat(location.lon)]}
            icon={pinIcon}
          >
            <Popup>
              <p>{location.display_name}</p>
              <p>
                {location.lon} {location.lat}
              </p>
            </Popup>
          </Marker> */}

          <Circle
            center={[parseFloat(location.lat), parseFloat(location.lon)]}
            pathOptions={fillBlueOptions}
            radius={1000}
          />

          {nearbyParkingSpots.length && !isUserLoading && userData
            ? nearbyParkingSpots.map((spot) => {
                const icon = checkForSize(spot.dimensions, userData.vehicleSize)
                  ? pinIconBlue
                  : pinIconRed;
                if (spot)
                  return (
                    <Marker
                      position={[spot?.latitude, spot?.longitude]}
                      icon={activeSpot === spot.id ? pinIconYellow : icon}
                      key={spot.id}
                      eventHandlers={{
                        click: () => {
                          spotSelection(spot.id);
                        },
                        popupclose: () => {
                          spotSelection("");
                        },
                      }}
                    >
                      <>
                        <Popup>
                          <div className={styles.spotWrapper}>
                            <h4>{spot.address}</h4>
                            {!checkForSize(
                              spot.dimensions,
                              userData.vehicleSize
                            ) && (
                              <p className={styles.dimensionError}>
                                Not available for your vehicle size.
                              </p>
                            )}
                            <p>{spot.description}</p>
                          </div>
                        </Popup>
                      </>
                    </Marker>
                  );
              })
            : nearbyParkingSpots.map((spot) => {
                if (spot)
                  return (
                    <Marker
                      position={[spot?.latitude, spot?.longitude]}
                      icon={pinIconGray}
                      key={spot.id}
                      eventHandlers={{
                        click: () => {
                          spotSelection(spot.id);
                        },
                        popupclose: () => {
                          spotSelection("");
                        },
                      }}
                    >
                      <>
                        <Popup offset={[0, -6]}>
                          <div className={styles.spotWrapper}>
                            <h4>{spot.address}</h4>
                            <p>{spot.description}</p>
                          </div>
                        </Popup>
                      </>
                    </Marker>
                  );
              })}
        </>
      ) : (
        ""
      )}
      <ResetView selectPosition={location} />
    </MapContainer>
  );
};

export default MapComponent;
