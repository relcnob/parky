import { SignInButton, SignUpButton, useUser } from "@clerk/nextjs";
import styles from "./index.module.scss";
import { type NextPage } from "next";
import Head from "next/head";
import { PageHeader } from "~/components/pageHeader/pageHeader";
import { UiBox } from "~/components/uiBox/uiBox";
import { Accordion } from "~/components/Accordion/Accordion";
import { Footer } from "~/components/Footer/Footer";
import Link from "next/link";
import { api } from "~/utils/api";
import { useEffect, useState } from "react";
import Image from "next/image";

import homeParkingImport from "../../public/home-parking.webp";
import homeDrivingImport from "../../public/home-driving.webp";
import homeHighwayImport from "../../public/home-highway.webp";
import homeFaqImport from "../../public/home-faq.webp";

import parCoinWhiteImport from "../../public/icon/parcoin_white.svg";
import sustainableIconImport from "../../public/icon/sustainable_driving.svg";
import speedIconImport from "../../public/icon/speed.svg";
import paymentsImport from "../../public/icon/payments.svg";
import { LoaderIcon } from "react-hot-toast";

const Home: NextPage = () => {
  const [userId, setUserId] = useState("");
  const user = useUser();
  const {
    data: userData,
    isLoading: isUserLoading,
    refetch: refetchUser,
  } = api.profile.getProfileById.useQuery({
    id: userId,
  });

  const homeParking = homeParkingImport as unknown as string;
  const homeDriving = homeDrivingImport as unknown as string;
  const homeHighway = homeHighwayImport as unknown as string;
  const homeFaq = homeFaqImport as unknown as string;
  const parCoinWhiteIcon = parCoinWhiteImport as unknown as string;
  const sustainableIcon = sustainableIconImport as unknown as string;
  const speedIcon = speedIconImport as unknown as string;
  const paymentsIcon = paymentsImport as unknown as string;

  useEffect(() => {
    if (user.user && user.isSignedIn && !isUserLoading) {
      setUserId(user?.user?.id);
      console.log(userData?.isDriver);
      void refetchUser();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user.user, isUserLoading]);

  return (
    <>
      <Head>
        <title>Parky | Easy parking everywhere</title>
        <meta
          name="description"
          content="Parky is a parking booking and renting service, head inside to learn more."
        />
        <link rel="icon" href="/favicon.svg" />
      </Head>
      <PageHeader secondaryMenu={false} secondaryMenuContents={null}>
        <div>
          <section className={styles.hero}>
            {user.isSignedIn && (
              <div>
                {userData ? (
                  <UiBox>
                    {user.isSignedIn && userData?.isDriver ? (
                      <>
                        <h3>Book a parking spot</h3>
                        <Link href="/map" className={styles.button}>
                          Find a parking spot
                        </Link>
                      </>
                    ) : user.isSignedIn && userData ? (
                      <>
                        <h3>Register as a driver</h3>
                        <Link
                          href="/account/settings"
                          className={styles.button}
                        >
                          Update settings
                        </Link>
                      </>
                    ) : (
                      ""
                    )}
                  </UiBox>
                ) : (
                  ""
                )}
                <Image
                  src={homeDriving}
                  alt="person driving a car"
                  width="1200"
                  height="1200"
                />
              </div>
            )}
            {user.isSignedIn && <span> OR </span>}
            {user.isSignedIn && (
              <div>
                {userData ? (
                  <UiBox>
                    {!userData?.isOwner && user.isSignedIn ? (
                      <>
                        <h3>Register as an owner</h3>
                        <Link
                          href="/account/settings"
                          className={styles.button}
                        >
                          Update settings
                        </Link>
                      </>
                    ) : userData?.isOwner && user.isSignedIn ? (
                      <>
                        <h3>Check your earnings</h3>
                        <Link href="/account/balance" className={styles.button}>
                          Check account balance
                        </Link>
                      </>
                    ) : (
                      ""
                    )}
                  </UiBox>
                ) : (
                  <span className={styles.loaderWrapper}>
                    <p>Loading user data</p>
                    <LoaderIcon />
                  </span>
                )}
                <Image
                  src={homeParking}
                  alt="parking space with cars"
                  width="1200"
                  height="1200"
                />
              </div>
            )}
            {!user.isSignedIn && (
              <section className={styles.newUser}>
                <UiBox>
                  <div>
                    <h2> New to Parky?</h2>
                    <p>
                      Join our network of drivers and owners to gain benefits.
                    </p>
                    <div>
                      <span className={styles.clerkButton}>
                        <SignUpButton redirectUrl="/profile/create" />
                      </span>
                      <span className={styles.clerkButton}>
                        <SignInButton />
                      </span>
                    </div>
                  </div>
                </UiBox>
                <Image
                  src={homeHighway}
                  alt="top-down view of a highway"
                  width="1920"
                  height="1200"
                />
              </section>
            )}
          </section>
          <section className={styles.explainer}>
            <h1>What is Parky?</h1>

            <div className={styles.explainerVideo}>
              <iframe
                width="1200"
                height="720"
                src="https://www.youtube.com/embed/s1nStBV1FCY"
                title="Parky"
                frameBorder="0"
                allow="accelerometer; clipboard-write; encrypted-media; gyroscope;"
                allowFullScreen
                loading="lazy"
              ></iframe>
            </div>
            <div className={styles.explainerWrapper}>
              <article>
                <span>1</span>

                <div>
                  <h3>Register an account</h3>
                  <p>
                    Parky can be accessed with your account, providing security
                    for both drivers and owners.
                  </p>
                </div>
              </article>
              <article>
                <span>2</span>
                <div>
                  <h3>Top up</h3>
                  <p>
                    Payments are handled through ParCoin - a platform currency
                    which can be exchanged for parking spots and other benefits.
                  </p>
                </div>
              </article>
              <article>
                <span>
                  <span>3</span>
                </span>
                <div>
                  <h3>Find the desired location</h3>
                  <p>
                    Parky map consists of rentable private parking spots
                    provided by other users of the platform.
                  </p>
                </div>
              </article>
              <article>
                <span>4</span>

                <div>
                  <h3>Book it</h3>
                  <p>
                    Booking process is quick and seamless, just adjust the
                    duration and date to proceed.
                  </p>
                </div>
              </article>
              <article>
                <span>5</span>
                <div>
                  <h3>Park in your spot</h3>
                  <p>
                    You are provided with a 15 minute window before and after if
                    your commute took longer than expected.
                  </p>
                </div>
              </article>
            </div>
          </section>
          {/* features */}
          <section className={styles.features}>
            <h1>Benefits</h1>
            <UiBox>
              <div>
                <Image
                  src={paymentsIcon}
                  alt="cash icon"
                  width="64"
                  height="64"
                />
              </div>
              <div>
                <h3>Save money</h3>
                <p>Rent a parking spot for a fraction of the price.</p>
              </div>
            </UiBox>
            <UiBox>
              <div>
                <Image
                  src={sustainableIcon}
                  alt="cash icon"
                  width="64"
                  height="64"
                />
              </div>
              <div>
                <h3>Drive sustainably</h3>
                <p>
                  Know exactly where your parking spot is and reduce your fuel
                  usage.
                </p>
              </div>
            </UiBox>
            <UiBox>
              <div>
                <Image src={speedIcon} alt="cash icon" width="64" height="64" />
              </div>
              <div>
                <h3>Quick booking</h3>
                <p>Find and book a parking spot in just seconds.</p>
              </div>
            </UiBox>
            <UiBox>
              <div>
                <Image
                  src={parCoinWhiteIcon}
                  alt="cash icon"
                  width="64"
                  height="64"
                />
              </div>
              <div>
                <h3>Get benefits</h3>
                <p>Join as a parking owner and gain additional benefits.</p>
              </div>
            </UiBox>
          </section>
          <section className={styles.faq}>
            <div>
              <Image
                src={homeFaq}
                alt="car with a question mark over it"
                width={1200}
                height={1200}
              />
            </div>
            <Accordion />
          </section>
          <Footer />
        </div>
      </PageHeader>
    </>
  );
};

export default Home;
