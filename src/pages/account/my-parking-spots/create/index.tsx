/* eslint-disable @typescript-eslint/restrict-plus-operands */
/* eslint-disable @typescript-eslint/no-unsafe-argument */
/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */

import type { NextPage } from "next"
import Head from "next/head"
import styles from "./index.module.scss"
import { DashboardWrapper } from "~/components/DashboardWrapper/DashboardWrapper"
import { UiBox } from "~/components/uiBox/uiBox"
import { type SubmitHandler, useForm } from "react-hook-form"
import { LoaderIcon, toast } from "react-hot-toast"
import { InputField } from "~/components/FormElements/InputField/InputField"
import { type RouterInputs, api } from "~/utils/api"
import { DashboardFooter } from "~/components/DashboardElements/components/DashboardFooter/DashboardFooter"
import { TextArea } from "~/components/FormElements/InputField/TextArea"
import { featureList } from "~/utils/features"
import type { OSMdata } from "~/components/MapComponent/utils"
import { useEffect, useState } from "react"
import { SearchResult } from "~/components/MapComponent/SearchResult"
import { NominatimUrl, type QueryParameters } from "~/pages/map"
import Link from "next/link"
import { UploadDropzone } from "@uploadthing/react"
import type { OurFileRouter } from "~/server/uploadthing"
import Image from "next/image"
import { iconHandler } from "~/components/ParkingSpotCard/components/SpotFeatures"

const CreateParkingPage: NextPage = () => {
    const { register, handleSubmit, setValue, watch } =
        useForm<RouterInputs["parking"]["create"]>()
    const {
        register: registerQuery,
        watch: watchQuery,
        setValue: setValueQuery,
    } = useForm({
        defaultValues: { parkingQuery: "" },
    })
    const { mutate, error } = api.parking.create.useMutation({
        onSuccess: () => {
            toast.success("Parking slot created")
        },
        onError: (e) => {
            toast.error(e.message)
        },
    })

    const onSubmit: SubmitHandler<RouterInputs["parking"]["create"]> = (data) => {
        mutate({
            ...data,
            availableEnd: data.availableEnd + ":00Z",
            availableStart: data.availableStart + ":00Z",
        })
        return
    }
    const [queryResults, setQueryResults] = useState<OSMdata[]>([])
    const [, setSelectPosition] = useState<OSMdata>()
    const [isDropdownVisible, setIsDropdownVisible] = useState(false)
    const [isSearching, setIsSearching] = useState(false)
    const parkingQuery = watchQuery("parkingQuery")
    useEffect(() => {
        setQueryResults([])
        setIsSearching(true)
        const delayDebounceFn = setTimeout(() => {
            const queryParameters: QueryParameters = {
                q: parkingQuery,
                format: "json",
                addressdetails: "1",
                polygon_geojson: "0",
            }
            const queryString = new URLSearchParams(queryParameters).toString()

            fetch(`${NominatimUrl}${queryString}`)
                .then((response) => response.text())
                .then((result: string) => {
                    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
                    const results: [OSMdata] = JSON.parse(result)
                    const filteredResults = results.filter(
                        (place) =>
                            place.class === "boundary" ||
                            place.class === "place" ||
                            place.class === "highway"
                    )
                    setIsSearching(false)
                    setQueryResults(filteredResults)
                    parkingQuery.length && setIsDropdownVisible(true)
                })
                .catch((err) => console.log("error:", err))
        }, 1000)
        return () => clearTimeout(delayDebounceFn)
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [parkingQuery])
    const imgUrl = watch("imageURL")
    return (
        <>
            <Head>
                <title>Parky | Easy parking everywhere</title>
                <meta name="description" content="Generated by create-t3-app" />
                <link rel="icon" href="/favicon.ico" />
            </Head>
            <main>
                <DashboardWrapper active="myparkingspots">
                    <>
                        <form
                            //eslint-disable-next-line
                            onSubmit={handleSubmit(onSubmit)}
                            className={styles.dashboard}
                        >
                            <div className={styles.header}>
                                <h2>Create parking spot</h2>
                                <Link href="/account/my-parking-spots"> Back</Link>
                            </div>
                            <UiBox>
                                <h3>General information</h3>
                                <div
                                    className={styles.inputWrapper}
                                    onBlur={() => setIsDropdownVisible(false)}
                                >
                                    <InputField
                                        name="parkingQuery"
                                        inputType="text"
                                        label="Address"
                                        placeholder="Street address"
                                        register={registerQuery}
                                    />
                                    <ul
                                        className={
                                            isDropdownVisible && parkingQuery !== watch("address")
                                                ? styles.resultsWrapper
                                                : // eslint-disable-next-line @typescript-eslint/restrict-template-expressions
                                                `${styles.resultsWrapper} ${
                                                // eslint-disable-next-line @typescript-eslint/restrict-template-expressions
                                                styles.dropdownHidden
                                                }`
                                        }
                                    >
                                        {/* eslint-disable-next-line */}
                                        {queryResults.length > 0 &&
                                            parkingQuery.length > 0 &&
                                            parkingQuery !== watch("address") ? (
                                            queryResults.map((place) => (
                                                <SearchResult
                                                    key={place.osm_id}
                                                    place={place}
                                                    onClick={() => {
                                                        setSelectPosition(place)
                                                        setValueQuery("parkingQuery", place.display_name)
                                                        setValue(
                                                            "latitude",
                                                            Number(parseFloat(place.lat).toFixed(5))
                                                        )
                                                        setValue(
                                                            "longitude",
                                                            Number(parseFloat(place.lon).toFixed(5))
                                                        )
                                                        setValue("address", place.display_name)
                                                        setIsDropdownVisible(false)
                                                    }}
                                                />
                                            ))
                                        ) : isSearching &&
                                            parkingQuery.length > 0 &&
                                            parkingQuery !== watch("address") ? (
                                            <li className={styles.spinner}>
                                                Searching...{" "}
                                                <span>
                                                    <LoaderIcon />
                                                </span>
                                            </li>
                                        ) : parkingQuery.length == 0 ? (
                                            <li className={styles.emptyState}>
                                                Please type your query.
                                            </li>
                                        ) : parkingQuery === watchQuery("parkingQuery") ? (
                                            <></>
                                        ) : (
                                            <li className={styles.emptyState}>No places found</li>
                                        )}
                                    </ul>
                                </div>
                                <div className={styles.hidden}>
                                    <InputField
                                        name="address"
                                        register={register}
                                        label=""
                                        inputType="hidden"
                                        placeholder="Address"
                                    />
                                    <InputField
                                        name="latitude"
                                        register={register}
                                        label=""
                                        inputType="hidden"
                                        placeholder=""
                                    />
                                    <InputField
                                        name="longitude"
                                        register={register}
                                        label=""
                                        inputType="hidden"
                                        placeholder=""
                                    />
                                </div>
                                <TextArea
                                    name="description"
                                    register={register}
                                    rows={10}
                                    cols={20}
                                    error={error?.data?.zodError?.fieldErrors["description"]?.at(
                                        0
                                    )}
                                    placeholder="Describe the location"
                                    label="Parking description"
                                />
                            </UiBox>
                            <UiBox className={styles.availabilityWrapper}>
                                <h3>Parking availability</h3>
                                <InputField
                                    name="availableStart"
                                    register={register}
                                    label="From"
                                    inputType="datetime-local"
                                    placeholder=""
                                    error={error?.data?.zodError?.fieldErrors[
                                        "availableStart"
                                    ]?.at(0)}
                                />
                                <InputField
                                    name="availableEnd"
                                    register={register}
                                    label="Until"
                                    inputType="datetime-local"
                                    placeholder=""
                                    error={error?.data?.zodError?.fieldErrors["availableEnd"]?.at(
                                        0
                                    )}
                                />
                            </UiBox>
                            <UiBox className={styles.details}>
                                <div className={styles.imageUploadWrapper}>
                                    <h4>Parking image</h4>
                                    <p>Upload an image from your parking spot</p>
                                    {!imgUrl && (
                                        <UploadDropzone<OurFileRouter>
                                            endpoint="imageUploader"
                                            onUploadError={(error) => {
                                                toast.error(
                                                    error.message +
                                                    " Try adding an image below 1MB in size"
                                                )
                                            }}
                                            onClientUploadComplete={(res) => {
                                                if (res?.at(0)?.fileUrl) {
                                                    setValue("imageURL", res[0]?.fileUrl)
                                                    toast.success("image uploaded successfully")
                                                }
                                            }}
                                        />
                                    )}
                                    {imgUrl && (
                                        <div className={styles.uploadedImageWrapper}>
                                            <Image
                                                width={120}
                                                height={120}
                                                src={imgUrl}
                                                alt="Parking image"
                                            />
                                            <h5>Image uploaded successfully</h5>
                                        </div>
                                    )}
                                </div>
                                <h4>Parking spot features</h4>
                                <div className={styles.featureList}>
                                    {featureList.map((feature) => (
                                        <span key={feature.value}>
                                            <Image
                                                src={iconHandler(feature.value)}
                                                alt={feature.value}
                                            />
                                            <InputField
                                                name={"features"}
                                                id={feature.value}
                                                placeholder=""
                                                label={feature.title}
                                                value={feature.value}
                                                register={register}
                                                inputType="checkbox"
                                            />
                                        </span>
                                    ))}
                                </div>
                                <h4>Parking details</h4>
                                <label className={styles.selectLabel}>
                                    Maximum vehicle size
                                    <select
                                        className={styles.selectInput}
                                        {...register("dimensions")}
                                    >
                                        <option value="XSMALL">Motorcycle</option>
                                        <option value="SMALL">Hatch back</option>
                                        <option value="MEDIUM">Sedan</option>
                                        <option value="LARGE">Van</option>
                                        <option value="XLARGE">Truck</option>
                                    </select>
                                </label>
                                <InputField
                                    name="price"
                                    register={register}
                                    label="Price per hour"
                                    inputType="number"
                                    placeholder=""
                                    error={error?.data?.zodError?.fieldErrors["price"]?.at(0)}
                                />
                            </UiBox>
                            <DashboardFooter>
                                <div>
                                    <input
                                        type="submit"
                                        value="Create listing"
                                        className={styles.primary}
                                    />
                                </div>
                            </DashboardFooter>
                        </form>
                    </>
                </DashboardWrapper>
            </main>
        </>
    )
}

export default CreateParkingPage
