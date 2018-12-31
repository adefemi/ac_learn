import React from 'react';
import propType from 'prop-types';
// Require Editor JS files.
import 'froala-editor/js/froala_editor.pkgd.min.js';


// Require Editor CSS files.
import 'froala-editor/css/froala_style.min.css';
import 'froala-editor/css/froala_editor.pkgd.min.css';
import '../../assets/css/common/cke.css';

// Require Font Awesome.
import 'font-awesome/css/font-awesome.css';

import FroalaEditor from 'react-froala-wysiwyg';

import $ from 'jquery';
import {serverHost} from "../../redux/reducer/extras";

window.$ = window.jQuery = $;

class CkeControl extends React.Component{
    render = (props = this.props) => (
        <FroalaEditor
            tag='textarea'
            config={{
                placeholder: "Type a message",
                imageUploadParam: 'upload',
                imageUploadURL: serverHost+'cke?type=froala'
            }}
            model={props.value}
            onModelChange={props.onChange}
        />
    )
}

CkeControl.propTypes = {
    onChange: propType.any,
    value: propType.any
}

export default CkeControl;