import EnquiryDashboard from "@/components/EnquiryDashboardDraft";

export const metadata = {
  title: "Enquiry Dashboard | Enromatics",
  description: "Students enquiry management and lead tracking",
};

export default function EnquiryDashboardPage({ params }: { params: { tenantId: string } }) {
  return <EnquiryDashboard tenantId={params.tenantId} />;
}
