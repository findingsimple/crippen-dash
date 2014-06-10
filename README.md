# Dash Pro Templates

The Dash Pro templates are built on top of the front-end framework [Twitter Bootstrap 2.3.2](http://getbootstrap.com/2.3.2), which allows us to create responsive templates that are easy to change and style using [LESS](http://lesscss.org), and has plenty of documentation and examples.

## Grid system

The default Bootstrap grid system utilises 12 columns, with the Dash Pro templates, we have changed that to 24 to allow more layout options.

## LESS

Twitter Bootstrap and by extension the Dash Pro templates use LESS. LESS is a CSS pre-processor - it extends the CSS language, adding features that allow variables, mixins, functions and many other techniques that allow you to make css that is more maintainable, themable and extendable.

We also provide pre-compiled CSS files if you are not comfortable using LESS.

There are many applications around to compile your LESS files to CSS.

* [CodeKit](http://incident57.com/codekit) (Mac OS X)
* [SimpLESS](http://wearekiss.com/simpless) (Universal)
* [WinLess](http://winless.org) (Windows)

Configure the application to compile the files in the `less` directory into the `css` directory eg. `less/bootstrap.less > css/bootstrap.css`.

## Styling the templates

Within the `less` directory, there are 4 LESS files, excluding the `less/bootstrap` directory.

1. **bootstrap.less** - This contains the base Bootstrap CSS.
2. **bootstrap-responsive.less** - This contains the CSS media queries required to make Bootstrap responsive.
3. **master.less** - This contains the base Dash Pro CSS.
4. **style.less** - This is where you'll add your changes, overwriting any CSS declared in the previous files listed.

To use Bootstrap's included mixins such as `.border-radius()`, your `style.less` should include `bootstrap/variables.less` and `bootstrap/mixins.less` like this:

	@import "bootstrap/variables.less";
	@import "bootstrap/mixins.less";
	
	.event-thumbnail img { .border-radius(5px) }

We recommend you try recreate your brand using LESS/CSS as much as possible, but understand the need to change the HTML of the templates, in this case, we require you to document each change so it is easy to import the templates back into Dash Pro.

The changes document may look like this:

	Line 28: Added extra stylesheet for jQuery plugin
	
	Template: event_ticket_page.html
	Line 71-79: Removed breadcrumbs
	
Please note that much of the content present in the templates will be replaced with data from the Dash Pro system eg. the event title, description, ticket types etc. Any content in the system generated slots in the submitted templates will not be imported into the system.

**Note:** The templates are responsive by default, so if you add HTML or make major changes to the design, it is your responsibility to ensure browser compatibility and responsiveness.



### Section or Page specific styles

All our templates have an ID and a Class attribute set on the `<body>` element, these allow you to style certain elements differently on specific pages eg. in the `event_ticket_page.html` template, the body element looks like `<body id="event-section" class="view-page">`, allowing you to target the elements in your LESS/CSS files like this: 

	#event-section .view-page .page-header { border: 0; }

## Responsive design

Bootstrap supports 5 different screen resolutions:

* Large Displays (1200px and up)
* Default (980px and up)
* Portrait Tablets (768px and up)
* Phones to Tablets (767px and down)
* Phones (480px and down)

These can each be disabled by editing and commented out the `bootstrap-responsive.less` and removing/commenting the `@import` statement, or if you're not going responsive at all, remove the `<link>` tag refering to `bootstrap-responsive.css` in the templates.