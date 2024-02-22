import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { z } from "zod"
import { Button } from "@/components/ui/button"
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage,
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Textarea } from "../textarea"
import FileUploader from "../global-components/FileUploader"
import { postValidation } from "@/lib/validation"
import { Models } from "appwrite"
import { useUserContext } from "@/context/AuthContext"
import { useToast } from "../use-toast"
import { useNavigate } from "react-router-dom"
import { useCreatePost } from "@/lib/react-query/queriesAndMutations"

type PostFormProps = {
  post? : Models.Document
}
 
const PostForm = ({ post } : PostFormProps) => {
    const { mutateAsync: createPost, isPending: isCreatingPost} = useCreatePost()
    const { user } = useUserContext()
    const { toast } = useToast()
    const navigate = useNavigate()

    // 1. Define your form.
    const form = useForm<z.infer<typeof postValidation>>({
      resolver: zodResolver(postValidation),
      defaultValues: {
        caption: post ? post?.caption : '',
        file: [],
        location : post ? post?.location : '',
        tags : post ? post.tags.join(',') : '',
      },
    })
   
    // 2. Define a submit handler.
    async function onSubmit(values: z.infer<typeof postValidation>) {
      const newPost = await createPost({...values, userId: user.id
      })
      if(!newPost) {
        toast({
          title: 'Error creating post, Please try again later'
        })
      }
      if(newPost){
        navigate('/')
      }
    }
  
  return (
    <Form {...form}>
    <form onSubmit={form.handleSubmit(onSubmit)} className="flex flex-col gap-9 w-full max-w-5xl">
      <FormField
        control={form.control}
        name="caption"
        render={({ field }) => (
          <FormItem>
            <FormLabel className="shad-form-label">Caption</FormLabel>
            <FormControl>
              <Textarea className="shad-textarea custom-scrollbar" {...field} />
            </FormControl>
            <FormDescription>
              This is your public display name.
            </FormDescription>
            <FormMessage className="shad-form_message" />
          </FormItem>
        )}
      />
       <FormField
        control={form.control}
        name="file"
        render={({ field }) => (
          <FormItem>
            <FormLabel className="shad-form-label">Add photos</FormLabel>
            <FormControl>
              <FileUploader
              fieldChange={field.onChange}
              mediaUrl={post?.imageUrl}
               />
            </FormControl>
            <FormDescription>
              This is your public display name.
            </FormDescription>
            <FormMessage className="shad-form_message" />
          </FormItem>
        )}
      />
        <FormField
        control={form.control}
        name="location"
        render={({ field }) => (
          <FormItem>
            <FormLabel className="shad-form-label">Add Location</FormLabel>
            <FormControl>
             <Input type="text" className="shad-input" {...field} />
            </FormControl>
            <FormDescription>
              This is your public display name.
            </FormDescription>
            <FormMessage className="shad-form_message" />
          </FormItem>
        )}
      />
              <FormField
        control={form.control}
        name="tags"
        render={({ field }) => (
          <FormItem>
            <FormLabel className="shad-form-label">Add Tags (separated by comma " , " )</FormLabel>
            <FormControl>
             <Input type="text" className="shad-input" placeholder="Frontend, Backend, FullStack" {...field} />
            </FormControl>
            <FormDescription>
              This is your public display name.
            </FormDescription>
            <FormMessage className="shad-form_message" />
          </FormItem>
        )}
      />
      <div className="flex gap-4 items-center justify-end">
      <Button type="button" className="shad-button_dark_4">Cancel</Button>
      <Button type="submit" className="shad-button_primary whitespace-nowrap">Submit</Button>
      </div>
    </form>
  </Form>
  )
}

export default PostForm