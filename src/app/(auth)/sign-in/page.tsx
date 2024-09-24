'use client';
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import {z} from 'zod'
import Link from 'next/link'
import { useToast } from "@/hooks/use-toast"
import { useRouter } from 'next/navigation'
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form'
import { Input } from "@/components/ui/input"
import { Button } from '@/components/ui/button'
import { signInSchema } from '@/schemas/signInSchema'
import { signIn } from 'next-auth/react'
import { redirect } from 'next/navigation'

const Page =()=>{
  const {toast } = useToast()
  const router = useRouter();

  const form = useForm<z.infer<typeof signInSchema>>({
    resolver: zodResolver(signInSchema)
  })

  const onSubmit = async(data: z.infer<typeof signInSchema>)=>{
    const result = await signIn('credentials', {
        redirect: false,
        identifier: data.identifier,
        password: data.password
    })
    console.log(result)

    if(result?.error){
        toast({
          title: "Login failed",
          description: "Incorrect usernmae or password",
          variant: "destructive"
        })
    }
    if(result?.ok){
      router.replace('/dashboard')
    }
    return 0;
  }


  return (
    <>
    <div className='flex justify-center items-center min-h-screen bg-gray-800'>
      <div className='w-full max-w-md p-8 space-y-8 bg-white rounded-lg shadow-md'>
        <div className="text-center">
          <h1 className="text-4xl font-extrabold tracking-tight lg:text-5xl mb-6">
            Join True Feedback
          </h1>
          <p className="mb-4">Sign in to start your anonymous adventure</p>
        </div>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className='space-y-4'>
          <FormField
            name="identifier"
            control={form.control}
            render={({ field }) => (
              <FormItem>
                <FormLabel>Email/Username</FormLabel>
                <FormControl>
                  <Input placeholder="email/username" 
                  {...field} 
                  />
                </FormControl>
                <FormMessage />
            </FormItem>
            )}
          />
          <FormField
            name="password"
            control={form.control}
            render={({ field }) => (
              <FormItem>
                <FormLabel>Password</FormLabel>
                <FormControl>
                  <Input type='password' placeholder="password" 
                  {...field} 
                  />
                </FormControl>
                <FormMessage />
            </FormItem>
            )}
          />
          <Button type='submit' >
            Signin
          </Button>
          </form>
        </Form>
        <div className="text-center mt-4">
          <p>
            Not a member yet?{' '}
            <Link href="/sign-up" className="text-blue-600 hover:text-blue-800">
              Sign up
            </Link>
          </p>
        </div>
      </div>
    </div>
    </>
  );
}

export default Page