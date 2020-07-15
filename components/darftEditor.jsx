import React, { Component } from 'react';
import { EditorState, ContentState, convertToRaw } from 'draft-js';
import { Editor } from 'react-draft-wysiwyg';
import draftToHtml from 'draftjs-to-html';
import htmlToDraft from 'html-to-draftjs';


export default class DarfEditor extends Component
{

    constructor(props) {
        super(props);
        this.state = {
            editorState: EditorState.createEmpty()
        };
    }

    componentDidMount = async () => {
        let { html, save } = this.props;
        const contentBlock = htmlToDraft(html || "");
        let contentState =  ContentState.createFromBlockArray(contentBlock.contentBlocks)
        await this.setState({ editorState:  EditorState.createWithContent(contentState) });
        if (save) {
            this.onSave();
        }
    }

    componentWillReceiveProps = (nextProps) => {
        let { save } = this.props;
        if (nextProps.save && nextProps.save != save) this.onSave();
    }

    getHtml = () => {
        let { editorState } = this.state;
        let htmlSource = draftToHtml(convertToRaw(editorState.getCurrentContent()));
        return htmlSource;
    }

    onEditorStateChange = (editorState) => {
        this.setState({ editorState });
    };

    onSave = () => {
        let { onSave } = this.props;
        if (typeof onSave == 'function') {
            let html = this.getHtml();
            onSave(html);
        }
    }

    render() {
        return (<Editor
            editorState={this.state.editorState}
            toolbarClassName="toolbarClassName"
            wrapperClassName="wrapperClassName"
            editorClassName="editorClassName"
            onEditorStateChange={this.onEditorStateChange}
        />)
    }

}