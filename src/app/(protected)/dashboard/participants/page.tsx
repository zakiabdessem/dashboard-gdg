"use client";
import { toast } from "sonner";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { instance } from "@/lib/axios";
import { redirect } from "next/navigation";
import { getSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { Switch } from "@/components/ui/switch";

declare module "next-auth" {
  interface Session {
    accessToken?: string;
  }
}

const formSchema = z.object({
  email: z.string(),
  name: z.string().min(3).max(56),
  contactNumber: z.string(),
  tShirtSize: z.string(),
  discordUsername: z.string(),
  github: z.string().optional(),
  linkedin: z.string().optional(),
  hasTeam: z.boolean(),
  teamName: z.string(),
  motivation: z.string().optional(),
  portfolio: z.string().optional(),
});

export default function Page() {
  return (
    <div className="w-full space-y-4 p-8">
      <CreateParticipantForm />
    </div>
  );
}

function CreateParticipantForm() {
  const router = useRouter();
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: "",
      name: "",
      contactNumber: "",
      tShirtSize: "",
      discordUsername: "",
      github: "",
      linkedin: "",
      hasTeam: false,
      teamName: "",
      motivation: "Added by admin",
      portfolio: "",
    },
  });

  async function onSubmit(values: z.infer<typeof formSchema>) {
    try {
      const res = await instance.post("/user/register/participant", values, {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${(await getSession())?.accessToken}`,
        },
      });

      if (res.status === 201) {
        toast.success("Participant added successfully.");
        form.reset();
      }

      router.push("/dashboard/participants");
    } catch (error) {
      console.error("Form submission error", error);
      toast.error((error as any).response.data.message);
    }
  }

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(onSubmit)}
        className="mx-auto max-w-3xl space-y-8 py-10"
      >
        <FormField
          control={form.control}
          name="email"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Email</FormLabel>
              <FormControl>
                <Input placeholder="" type="email" {...field} />
              </FormControl>
              <FormDescription>This is the participant email.</FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Full Name</FormLabel>
              <FormControl>
                <Input placeholder="" type="text" {...field} />
              </FormControl>
              <FormDescription>
                This is the participant full name.
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="contactNumber"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Phone number</FormLabel>
              <FormControl>
                <Input placeholder="" type="text" {...field} />
              </FormControl>
              <FormDescription>
                This is the participant phone number.
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="tShirtSize"
          render={({ field }) => (
            <FormItem>
              <FormLabel>T-shirt</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select a Size" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="S">S</SelectItem>
                  <SelectItem value="M">M</SelectItem>
                  <SelectItem value="L">L</SelectItem>
                  <SelectItem value="XL">XL</SelectItem>
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="discordUsername"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Discord</FormLabel>
              <FormControl>
                <Input placeholder="Joe1234" type="" {...field} />
              </FormControl>
              <FormDescription>
                This is the participant discord username.
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="grid grid-cols-12 gap-4">
          <div className="col-span-6">
            <FormField
              control={form.control}
              name="portfolio"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Portfolio </FormLabel>
                  <FormControl>
                    <Input placeholder="" type="text" {...field} />
                  </FormControl>
                  <FormDescription>
                    This is your public portfolio.
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          <div className="col-span-6">
            <FormField
              control={form.control}
              name="linkedin"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Linkedin</FormLabel>
                  <FormControl>
                    <Input placeholder="" type="" {...field} />
                  </FormControl>
                  <FormDescription>
                    This is your public linkedin url.
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
        </div>

        <FormField
          control={form.control}
          name="hasTeam"
          render={({ field }) => (
            <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
              <div className="space-y-0.5">
                <FormLabel>Has team</FormLabel>
                <FormDescription>
                  Does this participant have a team?
                </FormDescription>
              </div>
              <FormControl>
                <Switch
                  checked={field.value}
                  onCheckedChange={field.onChange}
                  aria-readonly
                />
              </FormControl>
            </FormItem>
          )}
        />

        {form.watch("hasTeam") && (
          <FormField
            control={form.control}
            name="teamName"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Team Name</FormLabel>
                <FormControl>
                  <Input placeholder="TeamX" type="" {...field} />
                </FormControl>
                <FormDescription>
                  This is the participant team name.
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
        )}

        <Button type="submit">Submit</Button>
      </form>
    </Form>
  );
}
