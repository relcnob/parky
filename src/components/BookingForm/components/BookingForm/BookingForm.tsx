/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/restrict-template-expressions */

import { type ParkingSpot } from "~/components/MapComponent/utils";
import { Button } from "~/components/button/button";
import styles from "./BookingForm.module.scss";
import { SignInButton, SignUpButton } from "@clerk/nextjs";
import ParCoin from "../../../../../public/icon/parkcoin-filled.svg";
import Image from "next/image";
import { InputField } from "~/components/FormElements/InputField/InputField";
import { useForm } from "react-hook-form";
import { api } from "~/utils/api";
import { toast } from "react-hot-toast";

type BookingFormProps = {
  userId?: string;
  userBalance?: number | null;
  spot: ParkingSpot[];
  isUserSignedIn?: boolean;
  bookingType: string;
  onCancel: () => void;
  bookingDate: string;
};

type BookingMutationProps = {
  price: number;
  end: string;
  start: string;
  driverId: string;
  parkingId: string;
};

export const BookingForm = ({
  bookingType,
  userId,
  userBalance,
  spot,
  isUserSignedIn,
  onCancel,
  bookingDate,
}: BookingFormProps) => {
  const parcoinIcon = ParCoin as string;
  const { register, watch } = useForm<{ duration: number }>({
    defaultValues: { duration: 1 },
  });
  const { duration } = watch();

  const { mutate: create } = api.booking.create.useMutation({
    onSuccess: () => {
      toast.success("booking created");
      onCancel();
    },
  });

  const bookParking = ({
    price,
    end,
    start,
    driverId,
    parkingId,
  }: BookingMutationProps) => {
    create({
      price: price,
      end: end,
      start: start,
      driverId: driverId,
      parkingId: parkingId,
    });
  };

  let contents: JSX.Element;
  if (!isUserSignedIn) {
    contents = (
      <div className={`${styles.formWrapper} `}>
        <h3>Book a parking spot</h3>
        <p className={styles.signin}>
          Please {<SignInButton />} or {<SignUpButton />} first to book a
          parking spot.
        </p>
        <div className={styles.buttonsWrapper}>
          <Button type="primary" text="Cancel" onClick={onCancel} />
        </div>
      </div>
    );
  } else if (
    isUserSignedIn &&
    spot &&
    spot[0] !== undefined &&
    spot[0].id &&
    userBalance &&
    userId
  ) {
    let totalPrice: number;
    if (bookingType === "monthly") {
      totalPrice = Math.floor((730 * spot[0].price) / 3);
    } else {
      totalPrice = duration * spot[0].price;
    }

    const spotId = spot[0].id;
    const startDate = new Date(bookingDate);
    const endDate = new Date(bookingDate);
    endDate.setHours(endDate.getHours() + duration);

    contents = (
      <>
        <div className={styles.formWrapper}>
          <h3>Book a parking spot</h3>
          <div className={styles.fieldWrapper}>
            <p className={styles.fieldHeader}>Account balance:</p>
            <p className={styles.parcoinwrapper}>
              {userBalance}
              <Image
                src={parcoinIcon}
                alt="parcoin icon"
                height="18"
                width="18"
                className={styles.parcoin}
              />
            </p>
          </div>
          <div className={styles.fieldWrapper}>
            <p className={styles.fieldHeader}>Parking name:</p>
            <p>{spot[0]?.address}</p>
            <p className={styles.fieldHeader}>Price per hour:</p>
            <p>{spot[0]?.price}</p>
            <p className={styles.fieldHeader}>Booking date:</p>
            <p>{`${bookingDate.split("T")[0]} ${bookingDate.split("T")[1]}`}</p>
            <p className={styles.fieldHeader}>Duration:</p>
            <div className={styles.inputFieldWrapper}>
              {bookingType === "hourly" ? (
                <InputField
                  inputType="number"
                  label=""
                  name="duration"
                  register={register}
                  placeholder="Hour amount"
                  min="0"
                />
              ) : (
                "30 days"
              )}
            </div>
          </div>
          <div className={styles.fieldWrapper}>
            <p className={styles.fieldHeader}>Total:</p>
            <p className={`${styles.parcoinwrapper} ${styles.totalPrice}`}>
              {totalPrice ? totalPrice : "-"}
              <Image
                src={parcoinIcon}
                alt="parcoin icon"
                height="18"
                width="18"
                className={styles.parcoin}
              />
            </p>
          </div>
          <div className={styles.errorWrapper}>
            {totalPrice > userBalance ? (
              <p className={styles.balanceError}>
                Insufficient balance, please top up your account.
              </p>
            ) : totalPrice < 0 ? (
              <p className={styles.balanceError}>
                Please select valid amount of hours.
              </p>
            ) : (
              ""
            )}
          </div>
          <div className={styles.buttonsWrapper}>
            <Button type="secondary" text="Cancel" onClick={onCancel} />
            <Button
              type="primary"
              text="Proceed"
              onClick={() =>
                bookParking({
                  price: totalPrice,
                  start: startDate.toISOString(),
                  driverId: userId,
                  parkingId: spotId,
                  end: endDate.toISOString(),
                })
              }
              isDisabled={
                totalPrice > userBalance || totalPrice < 0 || duration === 0
                  ? true
                  : false
              }
            />
          </div>
        </div>
      </>
    );
  } else {
    contents = <div>Something went wrong</div>;
  }
  return contents;
};