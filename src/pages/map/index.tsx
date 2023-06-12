/* eslint-disable @typescript-eslint/restrict-template-expressions */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */

import type { NextPage } from "next";
import { useEffect, useState } from "react";
import styles from "./map.module.scss";
import dynamic from "next/dynamic";
import { PageHeader } from "../../components/pageHeader/pageHeader";
import { InputField } from "~/components/FormElements/InputField/InputField";
import { type OSMdata } from "../../components/MapComponent/utils";
import { SearchResult } from "../../components/MapComponent/SearchResult";
import { ParkingSpotCard } from "~/components/ParkingSpotCard/ParkingSpotCard";
import { useForm } from "react-hook-form";
import { type RouterOutputs, api } from "~/utils/api";
import { useUser } from "@clerk/nextjs";
import { BookingForm } from "~/components/BookingForm/components/BookingForm/BookingForm";
import { PurchaseModal } from "~/components/BookingForm/components/PurchaseModal/PurchaseModal";
import { Button } from "~/components/button/button";
import { Toggle } from "~/components/Toggle/Toggle";
import Head from "next/head";
import Router from "next/router";
import Image from "next/image";

export type QueryParameters = {
  q: string;
  format: string;
  addressdetails: string;
  polygon_geojson: string;
};

const MapComponent = dynamic(
  () => import("../../components/MapComponent/MapComponent"),
  {
    ssr: false,
  }
);

export const NominatimUrl = "https://nominatim.openstreetmap.org/search?";

const Map: NextPage = () => {
  const [queryResults, setQueryResults] = useState<OSMdata[]>([]);
  const [selectPosition, setSelectPosition] = useState<OSMdata>();
  const [isDropdownVisible, setIsDropdownVisible] = useState(false);
  const [isSearching, setIsSearching] = useState(false);
  const [activeSpot, setActiveSpot] = useState("");
  const [nearbyParkingSpots, setNearbyParkingSpots] = useState<
    RouterOutputs["parking"]["getParkingWithinRange"]
  >([]);
  const [isBookingComplete, setIsBookingComplete] = useState<string>();
  const [purchaseFormContents, setPurchaseFormContents] =
    useState<JSX.Element>();
  const [isPurchaseFormVisible, setIsPurchaseFormVisible] = useState(false);
  const [bookingType, setBookingType] = useState("hourly");
  const [isLegendVisible, setIsLegendVisible] = useState(false);
  const [userId, setUserId] = useState("");
  const user = useUser();
  const today = new Date();
  today.setMinutes(today.getMinutes() - today.getTimezoneOffset());

  const { register, watch } = useForm<{ parkingQuery: string }>({
    defaultValues: { parkingQuery: "" },
  });

  const {
    register: registerBookingDate,
    watch: watchBookingDate,
    getValues,
  } = useForm<{
    bookingDate: string;
  }>({
    defaultValues: { bookingDate: today.toISOString().slice(0, 16) },
  });

  const { parkingQuery } = watch();

  const [variables, setVariables] = useState<QueryVariables>({
    current: { latitude: 1, longitude: 1 },
    range: 15,
  });

  const { data, isLoading } =
    api.parking.getParkingWithinRange.useQuery(variables);

  const {
    data: userData,
    isLoading: isUserLoading,
    refetch,
  } = api.profile.getProfileById.useQuery({
    id: userId,
  });

  type QueryVariables = {
    current: {
      latitude: number;
      longitude: number;
    };
    range: number;
  };

  useEffect(() => {
    if (data?.length) {
      const fetchedData = data;
      setNearbyParkingSpots(fetchedData);
    } else {
      setNearbyParkingSpots([]);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [data]);

  useEffect(() => {
    if (user.user && user.isSignedIn && !isUserLoading) {
      setUserId(user?.user?.id);
      void refetch();
    }
  }, [user.user, isUserLoading]);

  const findSpot = (spotId: string) => {
    const spot = nearbyParkingSpots.filter((spot) => spot.id === spotId);
    return spot;
  };

  const spotSelectionHandler = (spotId: string) => {
    setIsPurchaseFormVisible(true);

    if (!user.isSignedIn) {
      setPurchaseFormContents(
        <BookingForm
          spot={findSpot(spotId)}
          isUserSignedIn={user.isSignedIn}
          onCancel={() => setIsPurchaseFormVisible(false)}
          bookingType={bookingType}
          bookingDate={getValues("bookingDate")}
          userData={userData}
          setIsBookingComplete={(id: string) => {
            setIsBookingComplete(id);
          }}
        />
      );
    } else if (
      user.isSignedIn &&
      user.isLoaded &&
      findSpot.length &&
      userData
    ) {
      setPurchaseFormContents(
        <BookingForm
          isUserSignedIn={user.isSignedIn}
          onCancel={() => setIsPurchaseFormVisible(false)}
          userId={user.user.id}
          userData={userData}
          spot={findSpot(spotId)}
          userBalance={userData?.balance}
          bookingType={bookingType}
          bookingDate={getValues("bookingDate")}
          setIsBookingComplete={(id: string) => {
            setIsBookingComplete(id);
          }}
        />
      );
      // show parking booking form
    } else {
      setPurchaseFormContents(
        <>
          <div>Something went wrong, try again.</div>
          <Button
            type="secondary"
            text="Close"
            onClick={() => setIsPurchaseFormVisible(false)}
          />
        </>
      );
    }
  };

  useEffect(() => {
    isBookingComplete &&
      setPurchaseFormContents(
        <>
          <h3 className={styles.bookingCompleteHeader}>Booking completed</h3>
          <section className={styles.bookingCompleteText}>
            <p>Your booking number: </p> <p>{`#${isBookingComplete}`}</p>
          </section>
          <section className={styles.bookingCompleteButtons}>
            <Button
              type="secondary"
              text="Close"
              onClick={() => setIsPurchaseFormVisible(false)}
            />
            <Button
              type="primary"
              text="Proceed to booking"
              onClick={() => void Router.push(`/booking/${isBookingComplete}`)}
            />
          </section>
        </>
      );
  }, [isBookingComplete]);

  const mapHandler = () => {
    return (
      <div className={styles.secondaryMenu}>
        {/* daily/monthly selector */}
        <div className={styles.bookingType}>
          <Toggle
            names={["Daily/Hourly", "Monthly"]}
            values={["hourly", "monthly"]}
            activeValue={bookingType}
            // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
            onClick={(type) => setBookingType(type)}
          />
        </div>
        {/* address input */}
        <div
          className={styles.secondaryMenuWrapper}
          onFocus={() =>
            parkingQuery.length > 0
              ? setIsDropdownVisible(true)
              : setIsDropdownVisible(false)
          }
        >
          <div
            className={styles.inputWrapper}
            onBlur={() => setIsDropdownVisible(false)}
          >
            <InputField
              name="parkingQuery"
              inputType="text"
              label="Address"
              placeholder="Street address"
              register={register}
            />
            <ul
              className={
                isDropdownVisible
                  ? styles.resultsWrapper
                  : // eslint-disable-next-line @typescript-eslint/restrict-template-expressions
                    `${styles.resultsWrapper} ${
                      // eslint-disable-next-line @typescript-eslint/restrict-template-expressions
                      styles.dropdownHidden
                    }`
              }
            >
              {queryResults.length > 0 && parkingQuery.length > 0 ? (
                queryResults.map((place) => (
                  <SearchResult
                    key={place.osm_id}
                    place={place}
                    onClick={() => {
                      setSelectPosition(place);
                      setVariables({
                        current: {
                          latitude: parseFloat(place.lat),
                          longitude: parseFloat(place.lon),
                        },
                        range: 1000,
                      });
                    }}
                  />
                ))
              ) : isSearching && parkingQuery.length > 0 ? (
                <li className={styles.spinner}>
                  Searching... <span></span>
                </li>
              ) : parkingQuery.length == 0 ? (
                <li className={styles.emptyState}>Please type your query</li>
              ) : (
                <li className={styles.emptyState}>No places found</li>
              )}
            </ul>
          </div>
        </div>
        {/*date selector*/}
        <div className={styles.dateSelector}>
          <InputField
            inputType="datetime-local"
            label="Book from"
            name="bookingDate"
            placeholder={today.toISOString().slice(0, 16)}
            register={registerBookingDate}
            min={today.toISOString().slice(0, 16)}
          />
        </div>
        {/* search results wrapper */}
        <div className={styles.spotListControls}>
          <div className={styles.spotListControlsButtons}>
            <p></p>
            <p></p>
          </div>
        </div>
        <div className={styles.spotList}>
          <div className={styles.spotListWrapper}>
            {nearbyParkingSpots.length === 0 &&
            parkingQuery.length &&
            !isSearching ? (
              <div className={styles.spotListWrapperEmptyState}>
                No parking spots within 1km found. Please change location.
              </div>
            ) : isLoading ? (
              <div className={styles.spotListWrapperLoader}>
                <div className={styles.skeletonElement}></div>
                <div className={styles.skeletonElement}></div>
              </div>
            ) : nearbyParkingSpots.length > 0 && !isLoading ? (
              <div className={styles.spotListWrapperItems}>
                {nearbyParkingSpots.map((spot) => (
                  <ParkingSpotCard
                    spot={spot}
                    key={spot.id}
                    active={activeSpot === spot.id ? true : false}
                    isUserDataLoaded={userData ? true : false}
                    onClick={(spotId) => {
                      spotSelectionHandler(spotId);
                    }}
                    spotSelection={(id: string) => {
                      setActiveSpot(id);
                    }}
                  />
                ))}
              </div>
            ) : isSearching ? (
              <div className={styles.spotListWrapperLoader}>
                <div className={styles.skeletonElement}></div>
                <div className={styles.skeletonElement}></div>
              </div>
            ) : (
              <div className={styles.spotListWrapperEmptyState}>
                Please enter a street address.
              </div>
            )}
          </div>
        </div>
      </div>
    );
  };

  useEffect(() => {
    setQueryResults([]);
    setIsSearching(true);
    const delayDebounceFn = setTimeout(() => {
      const queryParameters: QueryParameters = {
        q: parkingQuery,
        format: "json",
        addressdetails: "1",
        polygon_geojson: "0",
      };
      const queryString = new URLSearchParams(queryParameters).toString();

      fetch(`${NominatimUrl}${queryString}`)
        .then((response) => response.text())
        .then((result: string) => {
          // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
          const results: [OSMdata] = JSON.parse(result);
          const filteredResults = results.filter(
            (place) =>
              place.class === "boundary" ||
              place.class === "place" ||
              place.class === "highway"
          );
          setIsSearching(false);
          setQueryResults(filteredResults);
          parkingQuery.length && setIsDropdownVisible(true);
        })
        .catch((err) => console.log("error:", err));
    }, 1000);
    return () => clearTimeout(delayDebounceFn);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [parkingQuery]);

  return (
    <>
      <Head>
        <title>Find parking | Parky</title>
        <meta name="Find parking" content="Generated by create-t3-app" />
        <link rel="icon" href="/favicon.svg" />
      </Head>
      <PageHeader
        secondaryMenu={true}
        secondaryMenuContents={mapHandler}
        active="map"
      >
        <div className={styles.mapWrapper}>
          {purchaseFormContents && (
            <PurchaseModal
              onCancel={() => setIsPurchaseFormVisible(false)}
              isVisible={isPurchaseFormVisible}
            >
              {purchaseFormContents}
            </PurchaseModal>
          )}
          <div
            onClick={() => setIsLegendVisible(true)}
            className={styles.legendToggle}
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="36"
              height="36"
              fill="#1b31a4"
              viewBox="0 0 16 16"
            >
              <path d="M5.255 5.786a.237.237 0 0 0 .241.247h.825c.138 0 .248-.113.266-.25.09-.656.54-1.134 1.342-1.134.686 0 1.314.343 1.314 1.168 0 .635-.374.927-.965 1.371-.673.489-1.206 1.06-1.168 1.987l.003.217a.25.25 0 0 0 .25.246h.811a.25.25 0 0 0 .25-.25v-.105c0-.718.273-.927 1.01-1.486.609-.463 1.244-.977 1.244-2.056 0-1.511-1.276-2.241-2.673-2.241-1.267 0-2.655.59-2.75 2.286zm1.557 5.763c0 .533.425.927 1.01.927.609 0 1.028-.394 1.028-.927 0-.552-.42-.94-1.029-.94-.584 0-1.009.388-1.009.94z" />
            </svg>
          </div>
          <section
            className={
              isLegendVisible
                ? styles.mapLegend
                : `${styles.mapLegendHidden} ${styles.mapLegend}`
            }
          >
            <span onClick={() => setIsLegendVisible(false)}>
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="36"
                height="36"
                fill="currentColor"
                viewBox="0 0 16 16"
              >
                <path d="M4.646 4.646a.5.5 0 0 1 .708 0L8 7.293l2.646-2.647a.5.5 0 0 1 .708.708L8.707 8l2.647 2.646a.5.5 0 0 1-.708.708L8 8.707l-2.646 2.647a.5.5 0 0 1-.708-.708L7.293 8 4.646 5.354a.5.5 0 0 1 0-.708z" />
              </svg>
            </span>
            <ul>
              <li>
                <Image
                  src="/icon/map-pin-blue.svg"
                  alt="parking icon"
                  width={24}
                  height={24}
                />
                Parking available
              </li>
              <li>
                <Image
                  src="/icon/map-pin-red.svg"
                  alt="parking icon"
                  width={24}
                  height={24}
                />
                Vehicle too large
              </li>
              <li>
                <Image
                  src="/icon/map-pin-yellow.svg"
                  alt="parking icon"
                  width={24}
                  height={24}
                />
                Selected parking
              </li>
              <li>
                <Image
                  src="/icon/map-pin-gray.svg"
                  alt="parking icon"
                  width={24}
                  height={24}
                />
                Loading parking data
              </li>
            </ul>
          </section>
          <MapComponent
            location={selectPosition}
            nearbyParkingSpots={nearbyParkingSpots}
            spotSelection={(id: string) => {
              setActiveSpot(id);
            }}
            activeSpot={activeSpot}
            userData={userData}
            isUserLoading={isUserLoading}
          />
        </div>
      </PageHeader>
    </>
  );
};

export default Map;
