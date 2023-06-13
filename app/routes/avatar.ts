import { ActionFunction, json } from "@remix-run/node";
import { requireUserId } from "~/utils/auth.server";
import { prisma } from "~/utils/prisma.server";
import { uploadAvatar } from "~/utils/s3.server";

export const action: ActionFunction = async ({ request }) => {
    const userId = await requireUserId(request)
    const imageUrl = await uploadAvatar(request)

    console.log(`Image URL: ${imageUrl}`)

    await prisma.user.update({
        data: {
            profile: {
                update: {
                    profilePicture: imageUrl
                }
            }
        },
        where: {
            id: userId
        }
    })

    return json({ imageUrl })
}