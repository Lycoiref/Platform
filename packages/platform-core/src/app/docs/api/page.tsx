'use client'

import { useEffect, useState } from 'react'
// import { MarkdownRender } from '@douyinfe/semi-ui'
import MarkdownRender from '@/components/MarkdownRender'

export default function MarkdownPage() {
	const [markdownContent, setMarkdownContent] = useState('')

	useEffect(() => {
		fetch('/content/api需求文档.md')
			.then((response) => response.text())
			.then((text) => {
				console.log(text)

				setMarkdownContent(text)
			})
	}, [])

	return <MarkdownRender md={markdownContent}></MarkdownRender>
	// return (
	// 	<MarkdownRender
	// 		raw={markdownContent}
	// 		format="md"
	// 	/>
	// )
}
