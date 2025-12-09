/* eslint-disable */
"use client";
import React, { useState, useMemo } from "react";
import { useQuery } from "@apollo/client";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { GET_PARTICIPANTS_BY_STATUS_QUERY } from "@/graphql/participants.gql";
import moment from "moment";
import { Edit, Plus, RefreshCwIcon, Trash, ViewIcon, ChevronUp, ChevronDown } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { IUser } from "@/types/participant";
import * as _ from "lodash";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import QRCode from "react-qr-code";
import { Input } from "@/components/ui/input";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { toast } from "sonner";
import { getSession } from "next-auth/react";
import { instance } from "@/lib/axios";
import { redirect } from "next/navigation";
import { useRouter } from "next/navigation";

export default function Page() {
  const router = useRouter();
  const [status, setStatus] = useState("pending");
  const { loading, error, data, refetch } = useQuery(
    GET_PARTICIPANTS_BY_STATUS_QUERY,
    {
      variables: { status },
    },
  );

  return (
    <div className="w-full space-y-4 p-8">
      <div className="flex items-center justify-between">
        <h1 className="mr-4 text-3xl font-semibold">Participants</h1>
        <div className="flex items-center justify-center space-x-2">
          <a href="/dashboard/participants/create">
            <Button variant="outline" className="flex items-center space-x-2">
              <Plus className="h-5 w-5" />
              <span>New</span>
            </Button>
          </a>
          <Button
            onClick={() => refetch()}
            variant="outline"
            className="flex items-center space-x-2"
          >
            <RefreshCwIcon className="h-5 w-5" />
            <span>Refresh</span>
          </Button>
        </div>
      </div>
      <ParticipantsTable
        data={data}
        loading={loading}
        error={error}
        status={status}
        setStatus={setStatus}
        router={router}
        refetch={refetch}
      />
    </div>
  );
}

const formSchema = z.object({
  email: z.string(),
  name: z.string().min(3).max(56),
  contactNumber: z.string(),
  tShirtSize: z.string(),
  discordUsername: z.string(),
  github: z.string().optional(),
  linkedin: z.string().optional(),
  status: z.string().optional(),
  portfolio: z.string().optional(),
  teamName: z.string().optional(),
});

function ParticipantsTable({
  data,
  loading,
  error,
  setStatus,
  refetch,
}: {
  loading: boolean;
  error: any;
  data: { participantsByStatus: IUser[] };
  status: string;
  router: any;
  setStatus: (status: string) => void;
  refetch: any;
}) {
  const [activeParticipant, setActiveParticipant] = useState<IUser>();
  const [sortConfig, setSortConfig] = useState<{
    key: 'teamName' | null;
    direction: 'ascending' | 'descending';
  }>({
    key: null,
    direction: 'ascending',
  });

  const handleEditClick = (participant: IUser) => {
    form.reset({ ...participant });
    setActiveParticipant(participant);
  };

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: "",
      name: "",
      contactNumber: "",
      tShirtSize: "",
      teamName: "",
      discordUsername: "",
      github: "",
      linkedin: "",
      status: "",
      portfolio: "",
    },
  });

  // Sort participants by team name (case-insensitive)
  const sortedParticipants = useMemo(() => {
    if (!data?.participantsByStatus) return [];

    const participants = [...data.participantsByStatus];
    
    if (sortConfig.key === 'teamName') {
      participants.sort((a, b) => {
        // Handle null/undefined team names by treating them as empty strings
        const teamA = (a.teamName || '').toLowerCase();
        const teamB = (b.teamName || '').toLowerCase();
        
        if (teamA < teamB) {
          return sortConfig.direction === 'ascending' ? -1 : 1;
        }
        if (teamA > teamB) {
          return sortConfig.direction === 'ascending' ? 1 : -1;
        }
        return 0;
      });
    }
    
    return participants;
  }, [data?.participantsByStatus, sortConfig]);

  const requestSort = (key: 'teamName') => {
    let direction: 'ascending' | 'descending' = 'ascending';
    
    if (sortConfig.key === key && sortConfig.direction === 'ascending') {
      direction = 'descending';
    }
    
    setSortConfig({ key, direction });
  };

  if (loading) return <p>Loading participants...</p>;
  if (error) return <p>Error loading participants!</p>;

  async function onSubmit(values: z.infer<typeof formSchema>) {
    try {
      const res = await instance.put(
        "/user/participant",
        { ...values, id: activeParticipant?._id },
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${(await getSession())?.accessToken}`,
          },
        },
      );

      if (res.status === 200) {
        toast.success("Participant updated successfully.");
      }
    } catch (error) {
      console.error("Form submission error", error);
      toast.error("Failed to update participant.");
    }

    refetch();
  }

  const handleUpdateStatus = async (newStatus: string) => {
    setStatus(newStatus);
    refetch({ status: newStatus });
  };

  const getSortIcon = (key: 'teamName') => {
    if (sortConfig.key !== key) {
      return <ChevronUp className="ml-1 h-4 w-4 opacity-30" />;
    }
    
    if (sortConfig.direction === 'ascending') {
      return <ChevronUp className="ml-1 h-4 w-4" />;
    }
    
    return <ChevronDown className="ml-1 h-4 w-4" />;
  };

  return (
    <Table className="w-full">
      <TableCaption>Details of all event participants</TableCaption>
      <TableHeader>
        <TableRow>
          <TableHead>Name</TableHead>
          <TableHead>Email</TableHead>
          <TableHead>Phone</TableHead>
          <TableHead className="whitespace-nowrap text-center">
            T-Shirt
          </TableHead>
          <TableHead className="whitespace-nowrap text-center">
            Last Check-In
          </TableHead>
          <TableHead className="whitespace-nowrap text-center">
            <Button
              variant="ghost"
              onClick={() => requestSort('teamName')}
              className="flex items-center justify-center p-0 hover:bg-transparent"
            >
              Team
              {getSortIcon('teamName')}
            </Button>
          </TableHead>
          <TableHead className="flex items-start justify-start">
            <Select
              onValueChange={(value) => {
                handleUpdateStatus(value);
              }}
            >
              <SelectTrigger className="w-[120px] border-none shadow-none">
                <SelectValue placeholder={status || "Status"} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="accepted">Accepted</SelectItem>
                <SelectItem value="rejected">Rejected</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
              </SelectContent>
            </Select>
          </TableHead>
          <TableHead>Actions</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {sortedParticipants?.map((participant: IUser) => {
          const checkInDates = participant.checkInDates;
          const lastCheckIn =
            checkInDates && checkInDates.length > 0
              ? moment(checkInDates[checkInDates.length - 1]).format(
                  "YYYY-MM-DD HH:mm",
                )
              : "N/A";

          return (
            <TableRow key={participant.email}>
              <TableCell>{participant.name}</TableCell>
              <TableCell>{participant.email}</TableCell>
              <TableCell>{participant.contactNumber}</TableCell>
              <TableCell className="text-center">
                {_.upperCase(participant.tShirtSize)}
              </TableCell>
              <TableCell className="text-center">{lastCheckIn}</TableCell>
              <TableCell className="whitespace-nowrap text-center">
                {participant.teamName || "—"}
              </TableCell>
              <TableCell className="ml-2 flex items-start justify-start text-start">
                <span
                  className={`inline-flex rounded-full px-2 py-1 text-xs font-semibold leading-5 ${
                    participant.status === "accepted"
                      ? "bg-green-100 text-green-800"
                      : participant.status === "rejected"
                        ? "bg-red-100 text-red-800"
                        : "bg-yellow-100 text-yellow-800" // Assuming default status is "pending"
                  }`}
                >
                  {participant.status
                    ? participant.status.charAt(0).toUpperCase() +
                      participant.status.slice(1)
                    : "Unknown"}
                </span>
              </TableCell>
              <TableCell className="space-x-2 whitespace-nowrap">
                <Dialog>
                  <DialogTrigger asChild>
                    <Button
                      onClick={() => handleEditClick(participant)}
                      variant="outline"
                      className="p-1"
                    >
                      <Edit width={20} height={20} />
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="w-full">
                    <DialogHeader>
                      <DialogTitle>Edit participant</DialogTitle>
                      <DialogDescription>
                        Make changes to the participant here. Click save when
                        you're done.
                      </DialogDescription>
                    </DialogHeader>
                    <Form {...form}>
                      <form
                        onSubmit={form.handleSubmit(onSubmit)}
                        className="grid w-full gap-4 py-4"
                      >
                        <div
                          style={{
                            height: "auto",
                            margin: "0 auto",
                            maxWidth: 180,
                            width: "100%",
                          }}
                        >
                          <QRCode
                            size={256}
                            style={{
                              height: "auto",
                              maxWidth: "100%",
                              width: "100%",
                            }}
                            value={participant._id}
                            viewBox={`0 0 256 256`}
                          />
                        </div>

                        <FormField
                          control={form.control}
                          name="email"
                          defaultValue={participant.email}
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Email</FormLabel>
                              <FormControl>
                                <Input placeholder="" type="email" {...field} />
                              </FormControl>
                              <FormDescription>
                                This is the participant email.
                              </FormDescription>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={form.control}
                          name="name"
                          defaultValue={participant.name}
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
                          name="teamName"
                          defaultValue={participant.name}
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>team Name</FormLabel>
                              <FormControl>
                                <Input placeholder="" type="text" {...field} />
                              </FormControl>
                              <FormDescription>
                                This is the participant team name.
                              </FormDescription>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={form.control}
                          name="portfolio"
                          defaultValue={participant.name}
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Portfolio</FormLabel>
                              <FormControl>
                                <Input
                                  placeholder=""
                                  type="text"
                                  {...field}
                                />
                              </FormControl>
                              <FormDescription>
                                This is the participant portfolio.
                              </FormDescription>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={form.control}
                          name="contactNumber"
                          defaultValue={participant.contactNumber}
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
                          defaultValue={participant.tShirtSize}
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>T-shirt</FormLabel>
                              <Select
                                onValueChange={field.onChange}
                                defaultValue={field.value}
                              >
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
                          name="status"
                          defaultValue={participant.status}
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Participant Status</FormLabel>
                              <Select
                                onValueChange={field.onChange}
                                defaultValue={field.value}
                              >
                                <FormControl>
                                  <SelectTrigger>
                                    <SelectValue placeholder="Select a status" />
                                  </SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                  <SelectItem value="pending">
                                    Pending
                                  </SelectItem>
                                  <SelectItem value="accepted">
                                    Accepted
                                  </SelectItem>
                                  <SelectItem value="rejected">
                                    Rejected
                                  </SelectItem>
                                </SelectContent>
                              </Select>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={form.control}
                          name="discordUsername"
                          defaultValue={participant.discordUsername}
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Discord</FormLabel>
                              <FormControl>
                                <Input
                                  placeholder="Joe1234"
                                  type=""
                                  {...field}
                                />
                              </FormControl>
                              <FormDescription>
                                This is the participant discord username.
                              </FormDescription>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                          <FormField
                          control={form.control}
                          name="discordUsername"
                          defaultValue={participant.github}
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Github</FormLabel>
                              <FormControl>
                                <Input
                                  placeholder="github"
                                  type=""
                                  {...field}
                                />
                              </FormControl>
                              <FormDescription>
                                This is the participant github username.
                              </FormDescription>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <DialogFooter>
                          <Button type="submit">Submit</Button>
                        </DialogFooter>
                      </form>
                    </Form>
                  </DialogContent>
                </Dialog>

                <Button variant="outline" className="p-1">
                  <Trash width={20} height={20} />
                </Button>
              </TableCell>
            </TableRow>
          );
        })}
      </TableBody>
    </Table>
  );
}