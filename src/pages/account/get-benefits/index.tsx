/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-unsafe-return */
/* eslint-disable @typescript-eslint/restrict-template-expressions */
import { type NextPage } from "next";
import { DashboardFooter } from "~/components/DashboardElements/components/DashboardFooter/DashboardFooter";
import { DashboardWrapper } from "~/components/DashboardWrapper/DashboardWrapper";
import Link from "next/link";
import styles from "./index.module.scss";
import Head from "next/head";
import { UiBox } from "~/components/uiBox/uiBox";
import { useEffect, useState } from "react";
import { Button } from "~/components/button/button";
import benefitList from "../../../components/BenefitItem/utils/benefitList.json";
import { BenefitItem } from "~/components/BenefitItem/BenefitItem";
import { api } from "~/utils/api";
import { toast } from "react-hot-toast";
import { useUser } from "@clerk/nextjs";
import Image from "next/image";
import { InputField } from "~/components/FormElements/InputField/InputField";
import { useForm } from "react-hook-form";

type Benefit = {
  name: string;
  price: number;
  image: string;
};

const GetBenefits: NextPage = () => {
  const user = useUser();
  const [showModal, setShowModal] = useState(false);
  const [showRefundModal, setShowRefundModal] = useState(false);
  const [activeBenefit, setActiveBenefit] = useState<Benefit>();
  const [userId, setUserId] = useState<string>("");

  const { register, watch, getValues } = useForm<{ amount: number }>({
    defaultValues: { amount: 0 },
  });

  const { mutate: removeCoin } = api.coin.subtractCoin.useMutation({
    onSuccess: () => {
      toast.success("Exchange completed");
      setShowModal(false);
      setShowRefundModal(false);
    },
    onError: () => {
      toast.error("something went wrong");
      setShowModal(false);
      setShowRefundModal(false);
    },
  });

  const { data: userData } = api.profile.getProfileById.useQuery({
    id: userId,
  });

  useEffect(() => {
    if (user?.user?.id && user.user) {
      setUserId(user.user.id);
    }
  }, [user.user, user.isLoaded]);

  const handleSubtract = (id: string, price: number) => {
    if (price && id) {
      removeCoin({
        fromAccountId: id,
        amount: price,
      });
    } else {
      toast.error("Something went wrong");
      setShowModal(false);
    }
  };

  return (
    <>
      <Head>
        <title>Get benefits | Parky</title>
        <meta name="Benefits page" content="Generated by create-t3-app" />
        <link rel="icon" href="/favicon.svg" />
      </Head>
      <>
        <div
          className={
            showModal && activeBenefit
              ? styles.modalWrapper
              : // eslint-disable-next-line @typescript-eslint/restrict-template-expressions
                `${styles.modalWrapper} ${styles.modalHidden}`
          }
        >
          <section>
            <h4>Claim benefit</h4>
            <p>
              {`You are about to claim`} <em>{activeBenefit?.name}</em>
              {` for `} <em>{`${activeBenefit?.price} Parcoins.`}</em>{" "}
              {` Are you sure?`}
            </p>
            <div className={styles.buttonWrapper}>
              <Button
                onClick={() => setShowModal(false)}
                text="Cancel"
                type="secondary"
              />
              <Button
                onClick={() => {
                  if (user.user && user && activeBenefit?.price) {
                    handleSubtract(user.user.id, activeBenefit.price);
                  }
                }}
                text="Claim"
                type="primary"
              />
            </div>
          </section>
        </div>
        <div
          className={
            showRefundModal
              ? styles.modalWrapper
              : // eslint-disable-next-line @typescript-eslint/restrict-template-expressions
                `${styles.modalWrapper} ${styles.modalHidden}`
          }
        >
          <section>
            <h4>Refund Parcoin</h4>
            <p className={styles.refundMessage}>
              Specify an amount of Parcoin to be refunded to your linked bank
              account. The exchange rate is 9 DKK per Parcoin.
            </p>
            <InputField
              inputType="number"
              label="Amount to be refunded"
              register={register}
              name="amount"
              placeholder="1"
              min={1}
              max={1000}
              error={
                watch("amount") < 1
                  ? "Please specify amount greater than zero"
                  : userData &&
                    userData.balance &&
                    watch("amount") > userData?.balance
                  ? "Please specify amount matching your balance"
                  : ""
              }
            />
            <span className={styles.amountInDkk}>
              {`You will receive: ${getValues("amount") * 9} DKK`}
            </span>
            <div className={styles.buttonWrapper}>
              <Button
                onClick={() => setShowRefundModal(false)}
                text="Cancel"
                type="secondary"
              />
              <Button
                onClick={() => {
                  if (
                    userData &&
                    user &&
                    userData.balance &&
                    user.user &&
                    watch("amount") > 0 &&
                    watch("amount") < userData.balance
                  ) {
                    handleSubtract(user.user.id, getValues("amount"));
                  }
                }}
                text="Refund"
                type="primary"
                isDisabled={user.user && userData?.balance ? false : true}
              />
            </div>
          </section>
        </div>
        <DashboardWrapper active="get-benefits">
          <>
            <div className={styles.contentWrapper}>
              <h2>Get benefits</h2>
              <UiBox className={styles.balanceRefund}>
                <h4>Refund Parcoin</h4>
                <span className={styles.currentBalance}>
                  <p>
                    Current balance: <em>{userData?.balance}</em>
                  </p>
                  <Image
                    src="/icon/parkcoin-filled.svg"
                    alt="parcoin"
                    width={16}
                    height={16}
                  />
                </span>
                <p className={styles.info}>
                  *the exchange rate is 9 DKK per exchanged Parcoin, all
                  exchanges are non-refundable.
                </p>
                <Button
                  onClick={() => {
                    setShowRefundModal(true);
                  }}
                  text="Refund"
                  type="primary"
                />
              </UiBox>
              <UiBox>
                <h4>Available benefits</h4>
                <div className={styles.headerWrappper}>
                  <p>Logo</p>
                  <p>Name</p>
                  <p>Price</p>
                  <p>Claim</p>
                </div>
                <ul className={styles.benefitsWrapper}>
                  {benefitList.map((benefit, index) => (
                    <BenefitItem
                      name={benefit.name}
                      key={index}
                      price={benefit.price}
                      image={benefit.image}
                      onClick={() => {
                        setShowModal(true);
                        setActiveBenefit({
                          name: benefit.name,
                          price: benefit.price,
                          image: benefit.image,
                        });
                      }}
                    />
                  ))}
                </ul>
              </UiBox>
              <DashboardFooter>
                <ul>
                  <li>
                    <Link href="/contact">Contact</Link>
                  </li>
                  <li>
                    <Link href="/help">Help</Link>
                  </li>
                </ul>
              </DashboardFooter>
            </div>
          </>
        </DashboardWrapper>
      </>
    </>
  );
};

export default GetBenefits;
