// NOTE: remove the line below before editing this file
/* eslint-disable */
"use client";
import { ComboboxParticipants } from "@/components/ParticipantCombobox";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
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
import { Label } from "@/components/ui/label";
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
// import { Textarea } from "@/components/ui/textarea";
import { GET_TEAMS_QUERY } from "@/graphql/teams.gql";
import { instance } from "@/lib/axios";
import { teamSchema } from "@/types/team";
// import { IUser } from "@/types/participant";
import { useQuery } from "@apollo/client";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Edit,
  Eye,
  EyeOff,
  FileUser,
  Plus,
  RefreshCwIcon,
  Trash,
  View,
} from "lucide-react";
import moment from "moment";
import { getSession } from "next-auth/react";
// import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";

export default function Page() {
  const { loading, error, data, refetch } = useQuery(GET_TEAMS_QUERY);

  return (
    <div className="w-full space-y-4 p-8">
      <div className="flex items-center justify-between">
        <h1 className="mr-4 text-3xl font-semibold">Teams</h1>
        <div className="flex items-center justify-center space-x-2">
          <a href="/dashboard/teams/create">
            <Button variant="outline" className="flex items-center space-x-2">
              <Plus className="h-5 w-5" />
              <span>New Team</span>
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
      {/* Teams Table Component */}
      <TeamsTable
        data={data}
        loading={loading}
        error={error}
        refetch={refetch}
      />
    </div>
  );
}

function ClipboardButton({ team }: { team: ITeam }) {
  const copyAllCredentials = () => {
    const credentials = `Team Name: ${team.name}\nUsername: ${team.username}\nPassword: ${team.password}`;
    navigator.clipboard.writeText(credentials).then(
      () => {
        toast.success("Credentials copied to clipboard!");
      },
      (err) => {
        console.error("Failed to copy credentials!", err);
      },
    );
  };

  return (
    <Button className="max-w-sm" onClick={copyAllCredentials}>
      Copy All Credentials
    </Button>
  );
}

interface ITeam {
  _id: string;
  name: string;
  username: string;
  password: string;
  total_points?: number;
  teamMembers?: ITeamMember[];
}

interface ITeamMember {
  _id: string;
  name: string;
  email: string;
  contactNumber: string | number;
  discordUsername?: string;
  tShirtSize?: string;
  checkInDates?: string[];
  status: string;
}

const useTeamForm = (defaultValues?: Partial<z.infer<typeof teamSchema>>) => {
  return useForm<z.infer<typeof teamSchema>>({
    resolver: zodResolver(teamSchema),
    defaultValues,
    mode: "onChange",
  });
};

function TeamsTable({
  data,
  loading,
  error,
  refetch,
}: {
  data: any;
  loading: boolean;
  error: any;
  refetch: any;
}) {
  const [selectedTeam, setSelectedTeam] = useState<ITeam | null>(null);
  const form = useTeamForm(
    selectedTeam
      ? {
          _id: selectedTeam._id,
          name: selectedTeam.name,
          username: selectedTeam.username,
          password: selectedTeam.password,
          total_points: selectedTeam.total_points,
          teamMembers: selectedTeam.teamMembers,
        }
      : {},
  );

  useEffect(() => {
    if (selectedTeam) {
      form.reset({
        _id: selectedTeam._id,
        username: selectedTeam.username,
        name: selectedTeam.name,
        password: selectedTeam.password,
        total_points: selectedTeam?.total_points,
        teamMembers: selectedTeam.teamMembers,
      });
    }
  }, [selectedTeam, form]);

  const handleEditClick = (team: ITeam) => {
    setSelectedTeam(team);
  };

  const onSubmit = async (values: z.infer<typeof teamSchema>) => {
    try {
      const res = await instance.put(`/team/`, values, {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${(await getSession())?.accessToken}`,
        },
      });

      if (res.status === 200) {
        toast.success("Team updated successfully.");
        form.reset();
        refetch();
      }
    } catch (error) {
      console.error("Form submission error", error);
      toast.error((error as any).response.data.message);
    }
  };

  if (loading) return <p>Loading teams...</p>;
  if (error) return <p>Error loading teams!</p>;

  return (
    <Table className="w-full">
      <TableCaption>Details of all teams</TableCaption>
      <TableHeader>
        <TableRow>
          <TableHead>Team Name</TableHead>
          <TableHead className="text-center">Team Members</TableHead>
          <TableHead className="text-center">Attendees</TableHead>

          <TableHead className="text-center">Total Points</TableHead>
          <TableHead className="text-center">Credentials</TableHead>

          <TableHead>Actions</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {data?.teams.map((team: ITeam) => (
          <TableRow key={team._id}>
            <TableCell>{team.name}</TableCell>
            <TableCell className="text-center">
              <Dialog>
                <DialogTrigger asChild>
                  <Button variant="outline" className="p-1 text-center">
                    <View width={20} height={20} />
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-2xl">
                  <DialogHeader>
                    <DialogTitle>Team Members</DialogTitle>
                    <DialogDescription>
                      This all the team members. Click save when you're done.
                    </DialogDescription>

                    <Table className="w-full">
                      <TableHeader>
                        <TableRow>
                          <TableHead>Full Name</TableHead>
                          <TableHead>Email</TableHead>
                          <TableHead>Phone</TableHead>
                          <TableHead>Last Check-In</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {team?.teamMembers?.map(
                          (user: ITeamMember, idx: number) => {
                            const checkInDates = user.checkInDates;
                            const lastCheckIn =
                              checkInDates && checkInDates.length > 0
                                ? moment(
                                    checkInDates[checkInDates.length - 1],
                                  ).format("YYYY-MM-DD HH:mm")
                                : "N/A";
                            return (
                              <TableRow key={idx}>
                                <TableCell>{user.name}</TableCell>
                                <TableCell>{user.email}</TableCell>
                                <TableCell>{user.contactNumber}</TableCell>
                                <TableCell className="text-center">
                                  {lastCheckIn}
                                </TableCell>
                                <TableCell>
                                  {/* Actions such as edit and view could be here */}
                                </TableCell>
                              </TableRow>
                            );
                          },
                        )}
                      </TableBody>
                    </Table>
                  </DialogHeader>
                </DialogContent>
              </Dialog>
            </TableCell>

            <TableCell className="text-center">
              {
                team.teamMembers?.filter(
                  (member: ITeamMember) =>
                    member.checkInDates && member.checkInDates.length > 0,
                ).length
              }
              /4
            </TableCell>
            <TableCell className="text-center">{team.total_points}</TableCell>
            <TableCell className="text-center">
              <Dialog>
                <DialogTrigger asChild>
                  <Button variant="outline" className="p-1">
                    <FileUser width={20} height={20} />
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-2xl">
                  <DialogHeader>
                    <DialogTitle>Team Credentials</DialogTitle>
                    <DialogDescription>
                      This is the team Credentials. Click anywhere when you're
                      done.
                    </DialogDescription>

                    <div className="space-y-2 py-6">
                      <div>
                        <Label>Full Name</Label>
                        <Input
                          defaultValue={team.name}
                          placeholder=""
                          type="text"
                          disabled
                        />
                      </div>

                      <div>
                        <Label>Username</Label>
                        <Input
                          defaultValue={team.username}
                          placeholder=""
                          type="text"
                          disabled
                        />
                      </div>

                      <div>
                        <Label>Password</Label>
                        <Input
                          defaultValue={team.password}
                          placeholder=""
                          type="password"
                          disabled
                        />
                      </div>
                    </div>
                  </DialogHeader>
                  <DialogFooter>
                    <ClipboardButton team={team} />
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            </TableCell>

            <TableCell>
              <TableCell className="space-x-2 whitespace-nowrap">
                <Dialog>
                  <DialogTrigger asChild>
                    <Button
                      onClick={() => handleEditClick(team)}
                      variant="outline"
                      className="p-1"
                    >
                      <Edit width={20} height={20} />
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="w-full">
                    <DialogHeader>
                      <DialogTitle>Edit team</DialogTitle>
                      <DialogDescription>
                        Make changes to the team here. Click save when you're
                        done.
                      </DialogDescription>
                    </DialogHeader>
                    <Form {...form}>
                      <form
                        onSubmit={form.handleSubmit(onSubmit)}
                        className="grid w-full gap-4 py-4"
                      >
                        <FormField // Field for team name
                          control={form.control}
                          name="name"
                          defaultValue={selectedTeam?.name}
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Name</FormLabel>
                              <FormControl>
                                <Input
                                  placeholder="Team Name"
                                  type="text"
                                  {...field}
                                />
                              </FormControl>
                              <FormDescription>
                                This is the team's name.
                              </FormDescription>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={form.control}
                          name="username"
                          defaultValue={selectedTeam?.username}
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Username</FormLabel>
                              <FormControl>
                                <Input
                                  placeholder="Username"
                                  type="text"
                                  {...field}
                                />
                              </FormControl>
                              <FormDescription>
                                This is the username used by the team.
                              </FormDescription>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <FormField // Field for username
                          control={form.control}
                          name="password"
                          defaultValue={selectedTeam?.password}
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Password</FormLabel>
                              <FormControl>
                                <PasswordField disabled={false} field={field} />
                              </FormControl>
                              <FormDescription>
                                This is the password used by the team.
                              </FormDescription>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={form.control}
                          name="total_points"
                          defaultValue={selectedTeam?.total_points}
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Total Points</FormLabel>
                              <FormControl>
                                <Input
                                  placeholder="Total Points"
                                  type="number"
                                  {...field}
                                />
                              </FormControl>
                              <FormDescription>
                                This is the total points accumulated by the
                                team.
                              </FormDescription>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={form.control}
                          name="teamMembers"
                          // defaultValue={activeTeam?.teamMembers?.map(member => ({
                          //   ...member,
                          //   contactNumber: Number(member.contactNumber),
                          // })) || []}
                          render={({ field }) => (
                            <FormItem className="flex flex-col">
                              <FormLabel>Team Members</FormLabel>
                              <FormControl>
                                <ComboboxParticipants form={form} />
                              </FormControl>
                              <FormDescription>
                                List of accepted team members usernames, one per
                                line.
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
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}

function PasswordField({
  defaultValue,
  disabled,
  field,
}: {
  defaultValue?: string;
  disabled?: boolean;

  field?: any;
}) {
  const [passwordVisible, setPasswordVisible] = useState(false);

  return (
    <div className="relative">
      <Input
        defaultValue={field.defaultValue || defaultValue}
        placeholder="Enter your password"
        type={passwordVisible ? "text" : "password"}
        disabled={disabled}
        className="pr-10"
        {...field}
      />
      <button
        type="button"
        className="absolute inset-y-0 right-0 top-0 flex items-center px-2 text-gray-500"
        onClick={() => setPasswordVisible(!passwordVisible)}
      >
        {passwordVisible ? <EyeOff size={20} /> : <Eye size={20} />}
      </button>
    </div>
  );
}
