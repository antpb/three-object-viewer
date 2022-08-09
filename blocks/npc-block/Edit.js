import { TextControl } from "@wordpress/components";
import { __ } from "@wordpress/i18n";
import { useBlockProps } from "@wordpress/block-editor";
import './editor.scss';

export const Editor = ({ value, onChange, isSelected }) => (
	<>
		{isSelected ? (
			<TextControl value={value} onChange={onChange} />
		) : (
			<p>{value}</p>
		)}
	</>
);

export default function Edit({ attributes, setAttributes, isSelected }) {
	return (
		<div {...useBlockProps()}>
			<Editor
				isSelected={isSelected}
				value={attributes.content}
				onChange={(content) => setAttributes({ content })}
			/>
		</div>
	);
}
