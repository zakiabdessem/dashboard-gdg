// NOTE: remove the line below before editing this file
/* eslint-disable */
"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { signIn } from "next-auth/react";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { zodResolver } from "@hookform/resolvers/zod";

const LoginSchema = z.object({
  email: z.string().email(),
  password: z.string(),
});

function Page() {
  const router = useRouter();

  const [error, setError] = useState("");

  const form = useForm<z.infer<typeof LoginSchema>>({
    resolver: zodResolver(LoginSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  const onSubmit = async (data: { email: string; password: string }) => {
    try {
      const result = await signIn("credentials", {
        redirect: false,
        email: data.email,
        password: data.password,
      });

      if (result?.error) {
        if (result.error === "CredentialsSignin" || result.status === 401) {
          setError("Invalid email or password. Please try again.");
        } else {
          setError(result.error);
        }
      } else {
        router.push("/dashboard");
      }
    } catch (err) {
      setError("An unexpected error occurred. Please try again later.");
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50">
      <div className="w-full max-w-sm rounded-lg bg-white p-8 shadow-lg">
        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(onSubmit)}
            className="flex w-full flex-col gap-6"
          >
            {error && (
              <div className="mb-4 text-sm font-medium text-red-500">
                {error}
              </div>
            )}
            <div className="flex w-full flex-col items-start gap-4">
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem className="w-full">
                    <FormLabel className="text-gray-700">Email</FormLabel>
                    <FormControl>
                      <Input
                        {...field}
                        placeholder="Enter your email"
                        className="w-full rounded-md border p-3 focus:ring-2 focus:ring-blue-400"
                      />
                    </FormControl>
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="password"
                render={({ field }) => (
                  <FormItem className="w-full">
                    <FormLabel className="text-gray-700">Password</FormLabel>
                    <FormControl>
                      <Input
                        type="password"
                        {...field}
                        placeholder="Enter your password"
                        className="w-full rounded-md border p-3 focus:ring-2 focus:ring-blue-400"
                      />
                    </FormControl>
                  </FormItem>
                )}
              />

              <div className="mt-4 flex w-full items-center justify-between">
                <Link
                  className="text-sm font-medium text-blue-500 hover:underline"
                  href={"/auth/reset"}
                >
                  Forgot password?
                </Link>
              </div>
            </div>
            <Button
              type="submit"
              variant="secondary"
              className="mt-6 w-full rounded-md bg-blue-600 p-3 text-white hover:bg-blue-700"
            >
              Login
            </Button>
          </form>
        </Form>
      </div>
    </div>
  );
}

export default Page;
