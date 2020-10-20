import React from 'react'

const QuickReply = ({ title, onClick }) => {
  return (
    <div>
      <button
        onClick={onClick}
        className="btn"
      >
        {title}
      </button>
    </div>
  )
}

export default QuickReply
