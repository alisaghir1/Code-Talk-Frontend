import { z } from "zod"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import {Form,FormControl,FormField,FormItem,FormLabel,FormMessage} from "@/components/ui/form"
import { signupValidation } from "@/lib/validation"
import Loader from "@/components/ui/global-components/Loader"
import { Link, useNavigate } from "react-router-dom"
import { useToast } from "@/components/ui/use-toast"
import { useCreateUserAccount, useSignInAccount } from "@/lib/react-query/queriesAndMutations"
import { useUserContext } from "@/context/AuthContext"


const SignupForm = () => {
  const { toast } = useToast()
  const { checkAuthUser } = useUserContext()
  const navigate = useNavigate()

  const {mutateAsync: createUserAccount, isPending: isCreatingAcccount } = useCreateUserAccount()

  const{ mutateAsync: signInAccount} = useSignInAccount()
   // 1. Define your form.
   const form = useForm<z.infer<typeof signupValidation>>({
    resolver: zodResolver(signupValidation),
    defaultValues: {
      name: "",
      username: "",
      email: "",
      password: ""
    },
  })
 
  // 2. Define a submit handler.
  async function onSubmit(values: z.infer<typeof signupValidation>) {
    const newUser = await createUserAccount(values)

    if(!newUser){
      return toast({
        title: "Sign up failed, please try again.",
      });
    }

    const session = await signInAccount({
      email: values.email,
      password: values.password,
    })

    if(!session){
      return toast({
        title: "Sign in failed, please try again.",
      });
    }

    const isLoggedIn = await checkAuthUser();

    if(isLoggedIn){
      form.reset();
      
      navigate('/')
    }else{
     return toast({ title: 'Sign up failed. Please try again later'})
    }

  }

  return (
    <Form {...form}>
      <div className="smLw-420 flex-center flex-col">
        <img src="assets/logo.png" width={200} height={150} alt="logo" />
        <h2 className="h3-bold md:h2-bold pt-5 sm:pt-12">Create a new account</h2>
        <p className="text-light-3 small-medium md:base-regular">To use CodeTalk please register down with your details</p>
    <form onSubmit={form.handleSubmit(onSubmit)} className="flex flex-col gap-5 w-full mt-4">
      <FormField
        control={form.control}
        name="name"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Name</FormLabel>
            <FormControl>
              <Input type="text" className="shad-input" {...field} />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
            <FormField
        control={form.control}
        name="username"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Username</FormLabel>
            <FormControl>
              <Input type="text" className="shad-input" {...field} />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
            <FormField
        control={form.control}
        name="email"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Email</FormLabel>
            <FormControl>
              <Input type="email" className="shad-input" {...field} />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
            <FormField
        control={form.control}
        name="password"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Password</FormLabel>
            <FormControl>
              <Input type="password" className="shad-input" {...field} />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
      <Button className="shad-button_primary" type="submit">
        {isCreatingAcccount ?
        <div className="flex-center gap-2">
          <Loader />
        </div> : 'Sign Up'
        }
        </Button>
        <p className="text-small-regular text-light-2 text-center mt-2">
          Already have an account?
          <Link className="text-primary-500 text-small-semibold ml-1" to={'/sign-in'}>Log in</Link>
        </p>
    </form>
    </div>
  </Form>
  )
}

export default SignupForm