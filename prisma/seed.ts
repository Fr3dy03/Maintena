import { PrismaClient, Role, Priority, WorkStatus } from '@prisma/client';
const prisma = new PrismaClient();
async function main() {
  const org = await prisma.organization.upsert({ where:{ id:'demo-org' }, update:{}, create:{ id:'demo-org', name:'Kijani Energy Services' } });
  const admin = await prisma.user.upsert({ where:{ email:'amina@demo.maintena.app' }, update:{}, create:{ email:'amina@demo.maintena.app', name:'Amina Okafor' } });
  await prisma.membership.upsert({ where:{ organizationId_userId:{ organizationId:org.id,userId:admin.id } }, update:{ role:Role.OWNER }, create:{ organizationId:org.id,userId:admin.id,role:Role.OWNER } });
  const sites = await Promise.all(['Kijani Mini-grid','Riverside offices','Maintena workshop'].map((name,i)=>prisma.site.upsert({ where:{ id:`demo-site-${i}` }, update:{}, create:{ id:`demo-site-${i}`,organizationId:org.id,name,locationText:['Northern Province','Lagos industrial estate','Central service yard'][i] } })));
  const category = await prisma.assetCategory.upsert({ where:{ id:'demo-inverter' }, update:{}, create:{ id:'demo-inverter',name:'Inverter' } });
  const asset = await prisma.asset.upsert({ where:{ assetCode:'AST-KJ-042' }, update:{}, create:{ organizationId:org.id,siteId:sites[0].id,categoryId:category.id,assetCode:'AST-KJ-042',publicToken:'demo-public-kj-042',serial:'SMA-DEMO-042',manufacturer:'SMA',model:'Sunny Tripower 25kW',installDate:new Date('2024-03-12'),nextServiceDue:new Date('2027-03-12') } });
  await prisma.warranty.upsert({ where:{ assetId:asset.id }, update:{}, create:{ assetId:asset.id,provider:'SMA regional warranty',startsAt:new Date('2024-03-12'),endsAt:new Date('2027-03-12'),terms:'Manufacturer defect coverage subject to inspection.',exclusions:'Improper installation, environmental damage and unauthorised repair.' } });
  await prisma.workOrder.upsert({ where:{ number:'WO-1048' }, update:{}, create:{ number:'WO-1048',organizationId:org.id,assetId:asset.id,siteId:sites[0].id,summary:'Inverter cooling alarm',description:'Inspect airflow and record readings.',priority:Priority.URGENT,status:WorkStatus.ASSIGNED,dueAt:new Date(),tasks:{ create:[{label:'Inspect vents and filters'},{label:'Record DC voltage'},{label:'Photograph fault indicator'}] } } });
}
main().finally(()=>prisma.$disconnect());