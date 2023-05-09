import { SignIn, SignInButton, SignOutButton, useUser } from "@clerk/nextjs";
import styles from "./index.module.css";
import { type NextPage } from "next";
import Head from "next/head";
import { api } from "~/utils/api";
import { useState } from "react";

const Home: NextPage = () => {
    const { mutate } = api.profile.create.useMutation()
    const profiles = api.profile.getAll.useQuery()
    const [firstName, setFirstName] = useState("")
    const [lastName, setLastName] = useState("")
    const [role, setRole] = useState("")
    const user = useUser()
    const handleSubmit = () => {
        mutate({
            firstName, lastName,
            role: role ? role as "DRIVER" | "OWNER" : "DRIVER",

        })
    }
    return (
        <>
            <Head>
                <title>Create T3 App</title>
                <meta name="description" content="Generated by create-t3-app" />
                <link rel="icon" href="/favicon.ico" />
            </Head>
            <main className={styles.main}>
                {!user.isSignedIn &&
                    <SignInButton></SignInButton>
                }
                {!!user.isSignedIn && <>
                    <SignOutButton></SignOutButton>

                    <div>
                        <input type="text" name="firstName" value={firstName} onChange={e => setFirstName(e.target.value)}></input>
                        <input type="text" name="lastName" value={lastName} onChange={e => setLastName(e.target.value)}></input>
                        <select name="role" id="role" onChange={e => setRole(e.target.value)}>
                            <option value="DRIVER">Driver </option>
                            <option value="OWNER">Owner</option>
                        </select>
                        <button onClick={handleSubmit}>Submit form</button>
                    </div>
                    <div>{JSON.stringify(profiles.data)}</div>
                </>
                }


                <SignIn path="/sign-in" routing="path" signUpUrl="/sign-up" />

            </main >
        </>
    );
};

export default Home;
