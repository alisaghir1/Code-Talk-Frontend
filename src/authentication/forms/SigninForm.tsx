import { z } from "zod"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import {Form,FormControl,FormField,FormItem,FormLabel,FormMessage} from "@/components/ui/form"
import { signinValidation } from "@/lib/validation"
import Loader from "@/components/ui/global-components/Loader"
import { Link, useNavigate } from "react-router-dom"
import { useToast } from "@/components/ui/use-toast"
import {  useSignInAccount } from "@/lib/react-query/queriesAndMutations"
import { useUserContext } from "@/context/AuthContext"


const SigninForm = () => {
  const { toast } = useToast()
  const { checkAuthUser} = useUserContext()
  const navigate = useNavigate()

  const{ mutateAsync: signInAccount, isPending: isSigningIn} = useSignInAccount()
   // 1. Define your form.
   const form = useForm<z.infer<typeof signinValidation>>({
    resolver: zodResolver(signinValidation),
    defaultValues: {
      email: "",
      password: ""
    },
  })
 
  // 2. Define a submit handler.
  async function onSubmit(values: z.infer<typeof signinValidation>) {

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
        <img src="/assets/logo.png" width={200} height={150} alt="logo" />
        <h2 className="h3-bold md:h2-bold pt-5 sm:pt-12">Log in to your account</h2>
        <p className="text-light-3 small-medium md:base-regular">Welcome back! Please enter your details </p>
    <form onSubmit={form.handleSubmit(onSubmit)} className="flex flex-col gap-5 w-full mt-4">
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
        {isSigningIn ?
        <div className="flex-center gap-2">
          <Loader />
        </div> : 'Sign in'
        }
        </Button>
        <p className="text-small-regular text-light-2 text-center mt-2">
          Dont't have an account?
          <Link className="text-primary-500 text-small-semibold ml-1" to={'/sign-up'}>Sign up</Link>
        </p>
    </form>
    </div>
  </Form>
  )
}

export default SigninForm