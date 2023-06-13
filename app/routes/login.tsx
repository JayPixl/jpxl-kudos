import { Layout } from "~/components/layout";
import { FormField } from "~/components/form-field";
import React, { useState, useEffect, useRef } from "react";
import { ActionFunction, LoaderFunction, json, redirect } from "@remix-run/node";
import { validateName, validateEmail, validatePassword } from "~/utils/validators.server";
import { login, register } from "~/utils/auth.server";
import { useActionData } from "@remix-run/react";
import { getUser } from "~/utils/auth.server";

export const loader: LoaderFunction = async ({ request }) => {
    return await getUser(request) ? redirect('/') : null
}

export const action: ActionFunction = async ({ request }) => {
    const form = await request.formData();
    const action = form.get("_action");
    const email = form.get("email");
    const password = form.get("password");
    let firstName = form.get("firstName");
    let lastName = form.get("lastName");

    if (
        typeof action !== "string" ||
        typeof email !== "string" ||
        typeof password !== "string"
    ) {
        return json({ error: `Invalid Form Data`, form: action }, { status: 400 })
    }
    if (
        action === "register" && (
            typeof firstName !== "string" ||
            typeof lastName !== "string"
        )
    ) {
        return json({ error: `Invalid Form Data`, form: action }, { status: 400 })
    }

    const errors = {
        email: validateEmail(email),
        password: validatePassword(password),
        ...(action === 'register') ? {
            firstName: validateName(firstName as string || ''),
            lastName: validateName(lastName as string || ''),
        } : {}
    }

    if (Object.values(errors).some(Boolean)) {
        return json({ errors, fields: { email, password, firstName, lastName }, form: action }, { status: 400 })
    }

    switch (action) {
        case "login": {
            return await login({ email, password, action });
        }
        case "register": {
            firstName = firstName as string;
            lastName = lastName as string;
            return await register({ email, password, action, firstName, lastName });
        }
        default:
            return json({ error: "Invalid Form Data" }, { status: 400 });
    }
}

export default function Login() {
    const actionData = useActionData()
    const [errors, setErrors] = useState(actionData?.errors || {})
    const [formError, setFormError] = useState(actionData?.error || '')
    const [action, setAction] = useState(actionData?.form || 'login');
    const firstLoad: any = useRef(true);
    const [formData, setFormData] = useState({
        email: actionData?.fields?.email || '',
        password: actionData?.fields?.password || '',
        firstName: actionData?.fields?.firstName || '',
        lastName: actionData?.fields?.lastName || ''
    })

    const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>, field: string) => {
        setFormData(form => ({
            ...form,
            [field]: event.target.value
        }))
    }

    useEffect(() => {
        // Clear the form if no switch forms
        console.log(action)
        console.log(firstLoad.current)
        actionData ? console.log(JSON.stringify(actionData)) : null
        if (!firstLoad.current) {
            const newState = {
                email: '',
                password: '',
                firstName: '',
                lastName: ''
            }
            setErrors(newState)
            setFormError('')
            setFormData(newState)
            console.log('Cleared!')
        }
    }, [action])

    useEffect(() => {
        if (!firstLoad.current) {
            setFormError('')
        }
    }, [formData])

    useEffect(() => {
        // We don't want to reset errors on page load because we want to see them
        if (process.env.NODE_ENV === 'production') {
            firstLoad.current = false
        } else {
            if (firstLoad.current === true) firstLoad.current = 1
            else if (firstLoad.current === 1) firstLoad.current = false
        }
    }, [])

    return <Layout>
        <div className="h-full flex justify-center items-center flex-col gap-y-4">
            <button
                onClick={() => setAction(action == 'login' ? 'register' : 'login')}
                className="absolute top-8 right-8 rounded-xl bg-yellow-300 font-semibold text-blue-600 px-3 py-2 transition duration-300 ease-in-out hover:bg-yellow-400 hover:-translate-y-1"
            >{action === 'login' ? "Sign Up" : "Log In"}</button>
            <h2 className="text-5xl font-extrabold text-yellow-300">Welcome to Kudos</h2>
            <p className="font-semibold text-slate-300">{
                action === 'login' ? 'Log In to Give Some Praise!' : 'Sign Up To Get Started!'
            }</p>

            <form method="POST" className="rounded-2xl bg-gray-200 p-6 w-96">
                <div className="text-xs font-semibold text-center tracking-wide text-red-500 w-full">
                    {formError}
                </div>
                <FormField
                    htmlFor="email"
                    label="Email"
                    value={formData.email}
                    onChange={e => handleInputChange(e, 'email')}
                    error={errors?.email}
                />
                <FormField
                    htmlFor="password"
                    label="Password"
                    type="password"
                    value={formData.password}
                    onChange={e => handleInputChange(e, 'password')}
                    error={errors?.password}
                />

                {
                    action !== 'login' ? <>
                        <FormField
                            htmlFor="firstName"
                            label="First Name"
                            value={formData.firstName}
                            onChange={e => handleInputChange(e, 'firstName')}
                            error={errors?.firstName}
                        />
                        <FormField
                            htmlFor="lastName"
                            label="Last Name"
                            value={formData.lastName}
                            onChange={e => handleInputChange(e, 'lastName')}
                            error={errors?.lastName}
                        />
                    </> : ''
                }

                <div className="w-full text-center">
                    <button
                        type="submit"
                        name="_action"
                        value={action}
                        className="rounded-xl mt-2 bg-yellow-300 px-3 py-2 text-blue-600 font-semibold cursor-pointer transition duration-300 ease-in-out hover:bg-yellow-400 hover:-translate-y-1"
                    >
                        {action === 'login' ? 'Log In' : 'Sign Up'}
                    </button>
                </div>
            </form>
        </div>
    </Layout>
}