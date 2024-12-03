type Props = {
  params: {
    conversationid: string
  }
}

const ConversationPage = async ({ params }: Props) => {
  const { conversationid } = await params;
  return <p>id:{conversationid}</p>
}

export default ConversationPage;