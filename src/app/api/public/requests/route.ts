import { NextResponse } from 'next/server';
import { z } from 'zod';
import { prisma } from '@/lib/prisma';
const schema=z.object({token:z.string().min(8),name:z.string().min(1).max(100),description:z.string().min(5).max(2000)});
export async function POST(request:Request){
  const data=schema.safeParse(Object.fromEntries(await request.formData()));
  if(!data.success)return NextResponse.json({error:'Please provide a valid request.'},{status:400});
  const asset=await prisma.asset.findUnique({where:{publicToken:data.data.token},select:{id:true,organizationId:true}});
  if(!asset)return NextResponse.json({error:'This asset link is invalid or expired.'},{status:404});
  const reference=`REQ-${Date.now().toString(36).toUpperCase()}`;
  const created=await prisma.serviceRequest.create({data:{reference,organizationId:asset.organizationId,assetId:asset.id,requesterName:data.data.name,description:data.data.description},select:{reference:true}});
  await prisma.activityEvent.create({data:{organizationId:asset.organizationId,type:'request_created',message:`Public service request ${created.reference} received`,}});
  return NextResponse.json({reference:created.reference,message:'Request received. A dispatcher will review it shortly.'},{status:201});
}