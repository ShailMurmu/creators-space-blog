tinymce.init({
	/* replace textarea having class .tinymce with tinymce editor */
	selector: "textarea.tinymce",
	
	/* theme of the editor */
	theme: "modern",
    
	skin: "lightgray",
	
	/* width and height of the editor */
	width: "100%",
	height: 300,
	
	/* display statusbar */
	statubar: true,
	
	/* plugin */
	plugins: [
		"advlist autolink autoresize link image lists charmap print preview hr anchor pagebreak",
		"searchreplace wordcount visualblocks visualchars code fullscreen insertdatetime nonbreaking",
		"save table contextmenu directionality emoticons template paste textcolor"
	],
    
    

	/* toolbar */
	toolbar: "insertfile undo redo | styleselect | bold italic underline | alignleft aligncenter alignright alignjustify | bullist numlist outdent indent | link image imageupload | print preview fullpage | forecolor backcolor emoticons",
    
    
    /*-----------------*/
    image_caption: true,
    image_title: true,
    body_id: 'my_id',
    content_css :'./../style/portfoliotemp-style.css',
    image_advtab: true,
    
    
    
    setup: function(editor) {
            var inp = $('<input id="tinymce-uploader" type="file" name="pic" accept="image/*" style="display:none">');
            $(editor.getElement()).parent().append(inp);

            inp.on("change",function(){
                var input = inp.get(0);
                var file = input.files[0];
                var fr = new FileReader();
                fr.onload = function() {
                    var img = new Image();
                    img.src = fr.result;
                    editor.insertContent('<img src="'+img.src+'"/>');
                    inp.val('');
                }
                fr.readAsDataURL(file);
            });

            editor.addButton( 'imageupload', {
                text:false,
                icon: 'upload',
                tooltip: 'Upload image from system',
                onclick: function(e) {
                    inp.trigger('click');
                }
            });
        },
     
    
    
    
	/*------------------*/
	/* style */
	style_formats: [
		{title: "Headers", items: [
			{title: "Header 1", format: "h1"},
			{title: "Header 2", format: "h2"},
			{title: "Header 3", format: "h3"},
			{title: "Header 4", format: "h4"},
			{title: "Header 5", format: "h5"},
			{title: "Header 6", format: "h6"}
		]},
		{title: "Inline", items: [
			{title: "Bold", icon: "bold", format: "bold"},
			{title: "Italic", icon: "italic", format: "italic"},
			{title: "Underline", icon: "underline", format: "underline"},
			{title: "Strikethrough", icon: "strikethrough", format: "strikethrough"},
			{title: "Superscript", icon: "superscript", format: "superscript"},
			{title: "Subscript", icon: "subscript", format: "subscript"},
			{title: "Code", icon: "code", format: "code"}
		]},
		{title: "Blocks", items: [
			{title: "Paragraph", format: "p"},
			{title: "Blockquote", format: "blockquote"},
			{title: "Div", format: "div"},
			{title: "Pre", format: "pre"}
		]},
        /*------------*/
        {style_formats: [
  {title: 'Image Left', selector: 'img', styles: {
    'float' : 'left',
    'margin': '0 10px 0 10px'
  }},
  {title: 'Image Right', selector: 'img', styles: {
    'float' : 'right',
    'margin': '0 10px 0 10px'
  }}
]
  },
        /*------------*/
        
		{title: "Alignment", items: [
			{title: "Left", icon: "alignleft", format: "alignleft"},
			{title: "Center", icon: "aligncenter", format: "aligncenter"},
			{title: "Right", icon: "alignright", format: "alignright"},
			{title: "Justify", icon: "alignjustify", format: "alignjustify"}
		]}
	]
});