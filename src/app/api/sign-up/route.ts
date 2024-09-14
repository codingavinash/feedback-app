import dbConnect from "@/lib/dbConnect";
import UserModel from "@/model/User";
import bcrypt from "bcryptjs";
import { sendVerificationEmail} from '@/helpers/sendVerificationEmail'

export async function POST(request: Request) {
    await dbConnect();

    try {
        const {username, email, password} = await request.json()

        const existingUserVerifiedByUsername = await UserModel.findOne({username,isVerified: true})

        if(existingUserVerifiedByUsername){
            console.log("User already exits")
            return Response.json({
                success: false,
                message: 'Username is already taken'
            },{
                status: 400
            })
        }

        const existingUserVerifiedByEmail = await UserModel.findOne({email})

        const verifyCode = Math.floor(100000 + Math.random() * 900000).toString();

        if(existingUserVerifiedByEmail){
            if(existingUserVerifiedByEmail.isVerified){
                return Response.json({
                    success: false,
                    message: 'User is already exits with this email'
                },{
                    status: 400
                })
            }
            else{
                const hassedPassword = await bcrypt.hash(password,10)

                existingUserVerifiedByEmail.password = hassedPassword
                existingUserVerifiedByEmail.verifyCode = verifyCode
                existingUserVerifiedByEmail.verifyCodeExpiry = new Date(Date.now() + 3600000)

                await existingUserVerifiedByEmail.save();
            }
        }
        else{
            const hassedPassword = await bcrypt.hash(password,10);
            const expireyDate = new Date;
            expireyDate.setHours(expireyDate.getHours() + 1)

            const newUser = await new UserModel({
                username,
                email,
                password: hassedPassword,
                verifyCode,
                verifyCodeExpiry: expireyDate,
                messages: []
            })
            await newUser.save()
        }
        const emailResponse = await sendVerificationEmail(email,username,verifyCode);
        console.log(emailResponse)
        if(!emailResponse.success){
            return Response.json({
                success: false,
                message: emailResponse.message
            },{
                status: 500
            })
        }

        return Response.json({
            success: true,
            message: "User registered succesfully. Please verify your email"
        },{
            status: 201
        })
    } catch (error) {
        console.error("Error in Registering user", error)

        return Response.json({
            success: false,
            message: 'Error registering user'
        },{
            status: 500
        })
    }
}