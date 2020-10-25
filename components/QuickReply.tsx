import React from 'react'

type QuickReplyProps = {
  title: string
  onClick: () => void
}

const QuickReply = ({ title, onClick } : QuickReplyProps) => {
  return (
    <button onClick={onClick} className="btn w-full">
      {title}
    </button>
  )
}

export default QuickReply
