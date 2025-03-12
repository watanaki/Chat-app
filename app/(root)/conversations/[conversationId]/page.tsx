import ConversationContainer from "@/components/shared/conversations/ConversationContainer";

type Props = {
  params: {
    conversationId: string
  }
}

const ConversationPage = async ({ params }: Props) => {
  const { conversationId } = await params;
  return <ConversationContainer>id:{conversationId}</ConversationContainer>
}

export default ConversationPage;