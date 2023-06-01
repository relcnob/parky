/* eslint-disable @typescript-eslint/no-unsafe-call */
import { SignIn, useUser } from "@clerk/nextjs"
import styles from "./create.module.scss"
import { type NextPage } from "next"
import Head from "next/head"
import CreateProfile from "~/components/CreateProfile/CreateProfile"
import { api } from "~/utils/api"
import Link from "next/link"
import { UiBox } from "~/components/uiBox/uiBox"
import Image from "next/image"
import { PageHeader } from "~/components/pageHeader/pageHeader"
import { useRouter } from "next/router"
import { BackToHomepage } from "~/components/BackToHomepage/BackToHomepage"
import { LoaderIcon } from "react-hot-toast"

const CreateProfilePage: NextPage = () => {
  const { user, isSignedIn, isLoaded } = useUser()
  const profile = user
    ? api.profile.getProfileById.useQuery({ id: user.id })
    : undefined
  if (!isLoaded) {
    return (
      <>
        <Head>
          <title>Create profile | Parky</title>
          <meta name="description" content="Generated by create-t3-app" />
          <link rel="icon" href="/favicon.ico" />
        </Head>
        <PageHeader secondaryMenu={false} secondaryMenuContents={null}>
          <div className={styles.signIn}>
            <span>
              Loading <LoaderIcon />
            </span>
          </div>
        </PageHeader>
      </>
    )
  }
  if (isSignedIn && !profile?.data?.id) {
    return (
      <>
        <Head>
          <title>Create profile | Parky</title>
          <meta name="description" content="Generated by create-t3-app" />
          <link rel="icon" href="/favicon.ico" />
        </Head>
        <PageHeader secondaryMenu={false} secondaryMenuContents={null}>
          <main className={styles.main}>
            <UiBox className={styles.box}>
              <CreateProfile />
            </UiBox>
          </main>
        </PageHeader>
      </>
    )
  }

  if (isSignedIn && profile?.data?.id) {
    return (
      <>
        <Head>
          <title>Create profile | Parky</title>
          <meta name="description" content="Generated by create-t3-app" />
          <link rel="icon" href="/favicon.ico" />
        </Head>
        <PageHeader secondaryMenu={false} secondaryMenuContents={null}>
          <BackToHomepage />
        </PageHeader>
      </>
    )
  }
  return (
    <>
      <Head>
        <title>Create profile | Parky</title>
        <meta name="description" content="Generated by create-t3-app" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <PageHeader secondaryMenu={false} secondaryMenuContents={null}>
        <div className={styles.signIn}>
          <SignIn redirectUrl="/profile/create" />
        </div>
      </PageHeader>
    </>
  )
}
export default CreateProfilePage
