import EnquiryDashboard from "@/components/EnquiryDashboard";

export const metadata = {
  title: "Enquiry Dashboard | Enromatics",
  description: "Students enquiry management and lead tracking",
};

export default async function EnquiryDashboardPage({ 
  params 
}: { 
  params: Promise<{ tenantId: string }> 
}) {
  const resolvedParams = await params;
  return <EnquiryDashboard tenantId={resolvedParams.tenantId} />;
}
