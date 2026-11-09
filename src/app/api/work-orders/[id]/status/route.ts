import { NextResponse } from 'next/server';
import { z } from 'zod';
import { prisma } from '@/lib/prisma';
import { canChangeStatus } from '@/lib/work-orders';
const schema=z.object({status:z.enum(['REQUESTED','ASSIGNED','IN_PROGRESS','BLOCKED','COMPLETED','CLOSED']),role:z.string()});
export async function POST(request:Request,{params}:{params:Promise<{id:string}>}){
  const parsed=schema.safeParse(await request.json());
  if(!parsed.success)return NextResponse.json({error:'Invalid status request.'},{status:400});
  const {id}=await params;
  const workOrder=await prisma.workOrder.findUnique({where:{id},select:{id:true,organizationId:true,status:true,number:true}});
  if(!workOrder)return NextResponse.json({error:'Work order not found.'},{status:404});
  if(!canChangeStatus(parsed.data.role,workOrder.status,parsed.data.status))return NextResponse.json({error:'This role cannot make that status transition.'},{status:403});
  const updated=await prisma.workOrder.update({where:{id},data:{status:parsed.data.status},select:{id:true,status:true}});
  await prisma.activityEvent.create({data:{organizationId:workOrder.organizationId,workOrderId:id,type:'status_changed',message:`${workOrder.number} changed to ${parsed.data.status}`}});
  return NextResponse.json(updated);
}