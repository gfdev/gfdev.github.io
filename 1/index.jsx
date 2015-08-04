'use strict';

var AppItem = React.createClass({    
    getInitialState: function () {
        return { hover: false, edit: false, selected: false };
    },
    
    handleMouseOver: function () {
        var state = this.state;
        
        state.hover = true;
        
        this.setState(state);
    },

    handleMouseOut: function () {
        var state = this.state;
        
        state.hover = false;
        
        this.setState(state);
    },
    
    handleClick: function (e) {
        e.stopPropagation();
        
        var state = this.state,
            control = 'dataset' in e.target
                ? e.target.dataset.control
                : e.target.getAttribute('data-control');
        
        switch (control) {
            case 'delete':
                this.props.onClickDelete(e);
                
                break;
            case 'checkbox':
                this.props.onChangeCheckbox(e);
                
                break;
            default:
                if (isNaN(this.clicks)) {
                    this.clicks = 1;
                } else {
                    this.clicks++;
                }
                
                var self = this;
                
                if (this.clicks == 1) {
                    setTimeout(function () {
                        if (self.clicks == 1) {
                            self._handleSingleClick(e);
                        } else {
                            self._handleDoubleClick(e);
                        }
                        
                        self.clicks = 0;
                    }, 300);
                }
        }
    },
    
    _handleSingleClick: function (e) {
        var state = this.state
        
        state.selected = !state.selected;
        
        this.setState(state);
    },
    
    _handleDoubleClick: function (e) {
        var state = this.state,
            self = this;
        
        state.edit = true;
        
        this.setState(state);
        
        setTimeout(function () {
            React.findDOMNode(self.refs.inputEdit).focus();
        }, 120);
    },
    
    handleKeyDown: function (e) {
        if (e.keyCode === 13) {
            var text = e.target.value.trim();
            
            if (text) this.props.onChangeInput(text);
        
            this.setState({ hover: false, edit: false });
        }
    },
    
    render: function () {
        var data = this.props.data,
            index = this.props.index,
            controlsElement = '';
        
        if (index != 0) {
            controlsElement = (
                <div className={'controls ' + (this.state.hover ? 'display-block' : 'display-none')}>
                    <label htmlFor={'input_' + index}>
                        <input id={'input_' + index} type='checkbox' defaultChecked={data.menu ? true : false} data-control='checkbox' /> menu
                    </label>
                    <button data-control='delete'>Delete</button>
                </div>
            );
        }
        
        return (
            <li className={(data.menu ? 'menu' : '') + (this.state.selected ? ' selected' : '')} onMouseOver={this.handleMouseOver} onMouseOut={this.handleMouseOut} onClick={this.handleClick}>
                <div className={this.state.edit ? 'display-none' : 'display-block'}>
                    <span className={this.state.hover ? 'trim' : ''}>{data.text}</span>
                    {controlsElement}
                </div>
                <div className={this.state.edit ? 'display-block' : 'display-none'}>
                    <input type='text' className={'edit'} ref='inputEdit' defaultValue={data.text} onKeyDown={this.handleKeyDown} />
                </div>
            </li>
        );
    }
});

var AppForm = React.createClass({
    getInitialState: function () {
        return { active: false };
    },
    
    handleSubmit: function (e) {
        e.preventDefault();
        
        var text = React.findDOMNode(this.refs.inputText).value.trim(),
            menu = React.findDOMNode(this.refs.menu).checked;
        
        if (!text) return;
        
        if (this.props.onFormSubmit(text, menu)) return;
        
        this.setState({ active: false });
        
        React.findDOMNode(this.refs.inputText).value = '';
        React.findDOMNode(this.refs.menu).checked = false;
    },
    
    handleClick: function (e) {
        this.setState({ active: true });
        
        var self = this;
        
        setTimeout(function () {
            React.findDOMNode(self.refs.inputText).focus();
        }, 120);
    },
    
    render: function () {
        return (
            <div>
                <form className={this.state.active ? 'display-block' : 'display-none'} onSubmit={this.handleSubmit}>
                    <input type='text' placeholder='Enter name here' ref='inputText' />
                    <input type='submit' value='Ok' />
                    <br />
                    <label htmlFor='is-menu'><input id='is-menu' type='checkbox' ref='menu' /> add to menu</label>
                </form>
                <button id='btn-form-toggle' className={this.state.active ? 'display-none' : 'display-block'} onClick={this.handleClick}>Add Page</button>
            </div>
        );
    }
});

var App = React.createClass({
    getDefaultProps: function () {
        return { timeoutDoubleClick: 300 }
    },
    
    getInitialState: function () {
        return {
            data: [
                { text: 'Home Page', menu: true },
                { text: 'Page #1', menu: false },
                { text: 'Page #2', menu: false },
                { text: 'Page #3', menu: false },
                { text: 'Page #4', menu: false },
                { text: 'Page #5', menu: false },
            ]
        };
    },
    
    handleClickDelete: function (index) {
        if (index != 0) {
            var data = this.state.data;
            
            data.splice(index, 1);
        
            this.setState({ data: data });
        }
    },
    
    handleChangeCheckbox: function (index, e) {
        if (index != 0) {
            var data = this.state.data;
            
            data[index].menu = e.target.checked ? true : false;
        
            this.setState({ data: data });
        }
    },
    
    handleFormSubmit: function (text, menu) {
        var data = this.state.data;//.concat({ text: text, menu: menu });
        
        if (data.map(function (item) { return item.text; }).indexOf(text) === -1 ) {
            this.setState({ data: data.concat({ text: text, menu: menu }) });
        } else {
            return true;
        }
        
        return;
    },
    
    handleChangeName: function (index, name) {
        var data = this.state.data;
        
        data[index].text = name;
    
        this.setState({ data: data });
    },
    
    render: function () {
        var self = this;
        
        return (
            <div>
                <h2>React.js Test Task</h2>
                <ul>
                    {
                        this.state.data.map(function (data, index) {
                            return <AppItem
                                onClickDelete={self.handleClickDelete.bind(self, index)}
                                onChangeCheckbox={self.handleChangeCheckbox.bind(self, index)}
                                onChangeInput={self.handleChangeName.bind(self, index)}
                                key={index}
                                data={data}
                                index={index} />
                        })
                    }
                    <li className='form'>
                        <AppForm onFormSubmit={self.handleFormSubmit}/>
                    </li>
                </ul>
            </div>
        );
    }
});

React.render(<App />, document.body);
