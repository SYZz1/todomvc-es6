
//测试数据，获取数据方法(axios,ajax,request...)
var todoList = [
    {
        id: 1,
        name: 'SSSSSSSSSSSSSSSSS',
        checkstate: false
    },
    {
        id: 2,
        name: 'YYYYYYYYYYYYYYYYY',
        checkstate: false
    },
    {
        id: 3,
        name: 'ZZZZZZZZZZZZZZZZ',
        checkstate: false
    }
];
localStorage.setItem('todos', JSON.stringify(todoList))



/**
 * @class {模型} Model
 * Model 将新的数据发送到 View，用户得到反馈
 * 
 */
class Model {
    constructor() {
        this.todos = JSON.parse(localStorage.getItem('todos')) || []
    }

    //用来使用回调数据
    bindTodoListChanged(callback) {
        this.onTodoListChanged = callback
    }

    _commit(todos) {
        this.onTodoListChanged(todos)
        localStorage.setItem('todos', JSON.stringify(todos))
    }

    //添加实体
    addTodo(todoName) {
        const todo = {
            id: this.todos.length > 0 ? this.todos[this.todos.length - 1].id + 1 : 1,
            name: todoName,
            checkstate: false,
        }

        this.todos.push(todo)

        this._commit(this.todos)
    }

    //编辑实体（修改名称）
    editTodo(id, updatedName) {
        this.todos = this.todos.map(todo =>
            todo.id === id ? { id: todo.id, name: updatedName, checkstate: todo.checkstate } : todo
        )

        this._commit(this.todos)
    }

    //删除实体
    deleteTodo(id) {
        this.todos = this.todos.filter(todo => todo.id !== id)

        this._commit(this.todos)
    }

    //编辑实体（全部选中列控制）
    allCheckTodo(param) {
        if (param) {
            this.todos = this.todos.map(todo =>
                ({ id: todo.id, name: todo.name, checkstate: true })
            )
        } else {
            this.todos = this.todos.map(todo =>
                ({ id: todo.id, name: todo.name, checkstate: false })
            )
        }
        this._commit(this.todos)
    }

    //编辑实体（选中当前列控制）
    toggleTodo(id) {
        this.todos = this.todos.map(todo =>
            todo.id === id ? { id: todo.id, name: todo.name, checkstate: !todo.checkstate } : todo
        )

        this._commit(this.todos)
    }

    //清除实体中选中状态为true的数据
    clearComped() {
        this.todos = this.todos.filter(todo => todo.checkstate !== true)
        this._commit(this.todos)
    }

}

/**
 * @class {视图} View
 * View 传送指令到 Controller
 * 
 */
class View {
    constructor() {
        this.app = this.getElement({ selector: '#root', document: document })  //视图根元素
        //初始化视图渲染
        this.initializeView()
    }


    //dom元素渲染控制
    displayTodos(todos) {
        let todoListElem = this.getElement({ selector: '.todo-list', document: this.app }) //ul列表
        let footer = this.getElement({ selector: '.footer', document: this.app })   //底部控制栏
        let itemCount = this.getElement({ selector: '.todo-count', document: this.app })  //清空按钮
        let clearCompleted = this.getElement({ selector: '.clear-completed', document: this.app })  //清空按钮
        // 清除历史dom标签
        while (todoListElem.firstChild) {
            todoListElem.removeChild(todoListElem.firstChild)
        }
        var listElement = "";
        todos.forEach(element => {
            listElement += '<li data-id="' + element.id + '" class="' + (element.checkstate ? "completed" : "") + '" >'
                + '<div class="view">'
                + '<input class="toggle" type="checkbox" ' + (element.checkstate ? "checked" : "") + ' >'
                + '<label>' + element.name + '</label>'
                + '<button class="destroy" ></button>'
                + '</div>'
                + '<input class="edit" value="' + element.name + '" placeholder="该内容不能为空" >'
                + '</li>';
            if (element.checkstate) {
                clearCompleted.style.display = "unset";
            }
        });
        if (todos.length > 0) {
            footer.style.display = "block";
        } else {
            footer.style.display = "none";
        }
		let todosCheckstate = todos.filter(todo => todo.checkstate === true);
        itemCount.firstChild.innerText = todosCheckstate.length;
        todoListElem.innerHTML = listElement;
        //todoListElem.append(itemList)
    }

    // 查找获取dom元素
    getElement({ selector, document }) {
        const element = document.querySelector(selector)
        return element
    }

    //提供Control绑定（监听回车事件）
    bindAddTodo(handler) {
        //输入框绑定回车添加数据
        let addListItem = this.getElement({ selector: '.new-todo', document: this.app });
        addListItem.addEventListener('keypress', event => {
            //event.preventDefault();  //submit 
            if (event.charCode === 13) {
				if(event.target.value.replace(/ /g,'')=="") return alert("添加内容不能为空！");
                handler(event.target.value)
                event.target.value = "";
            }
        })
    }

    //提供Control绑定（监听删除事件）
    bindDeleteTodo(handler) {
        //let deleteListItem = this.getElement({ selector: '.destroy', document: this.app }); //当前元素是动态的故监听会失效
        let todoListElem = this.getElement({ selector: '.todo-list', document: this.app }) //列表
        todoListElem.addEventListener('click', event => {
            if (event.target.className === "destroy") {
                const id = parseInt(event.target.parentElement.parentElement.getAttribute('data-id'), 10)
                handler(id);
            }
        })
    }

    //提供Control绑定（编辑当前列）
    bindEditTodo(handler) {
        let todoListElem = this.getElement({ selector: '.todo-list', document: this.app }) //列表
        todoListElem.addEventListener('dblclick', event => {
            if (event.target.tagName == "LABEL") {
				var focusCount = document.querySelectorAll(".editing").length;
				if(focusCount > 0){
					return;
				}
                if (event.target.parentElement.parentElement.className.indexOf("editing") < 0) {
                    event.target.parentElement.parentElement.setAttribute("class", event.target.parentElement.parentElement.className + " editing");
                }
				event.target.parentElement.parentElement.querySelector(".edit").focus(); //.nextSibling
            }

        })
        todoListElem.addEventListener('focusout', event => {
            if (event.target.type == "text") {
				const id = parseInt(event.target.parentElement.getAttribute('data-id'), 10);
				if(event.target.value.replace(/ /g,'')=="") {
					//alert("添加内容不能为空！"); 
					event.target.style.border="1px solid red";
					return event.target.focus();
				}else{
					event.target.style.border="1px solid #999";
					handler(id, event.target.value);
				}
            }
        })
    }

    //提供Control绑定（控制点击全选）
    bindAllCheckTodo(handler) {
        let todoAllcheckElem = this.getElement({ selector: '.toggle-all', document: this.app }) //全选标签
        let todoListElem = this.getElement({ selector: '.todo-list', document: this.app }) //todoList列表
        todoAllcheckElem.addEventListener('click', event => {
            if (event.target.tagName.toLowerCase() === 'input') {
                // const id = parseInt(event.target.parentElement.parentElement.getAttribute('data-id'), 10)
                // //效果
                // let clearCompleted = this.getElement({ selector: '.clear-completed', document: this.app })
                let clearState = false;
                todoListElem.childNodes.forEach(item => {
                    if (!item.getElementsByClassName("view")[0].getElementsByClassName("toggle")[0].checked) {
                        clearState = true;
                    }
                })
                handler(clearState)
            }
        })
    }


    //提供Control绑定（控制选中状态）
    bindToggleTodo(handler) {
        let todoListElem = this.getElement({ selector: '.todo-list', document: this.app }) //列表
        todoListElem.addEventListener('change', event => {
            if (event.target.type === 'checkbox') {
                const id = parseInt(event.target.parentElement.parentElement.getAttribute('data-id'), 10)
                handler(id)
                //效果
                let clearCompleted = this.getElement({ selector: '.clear-completed', document: this.app })
                let clearState = false;
                todoListElem.childNodes.forEach(item => {
                    if (item.getElementsByClassName("view")[0].getElementsByClassName("toggle")[0].checked) {
                        clearState = true;
                    }
                })
                if (clearState) {
                    clearCompleted.style.display = "unset";
                } else {
                    clearCompleted.style.display = "none";
                }
            }
        })
    }


    //状态展示控制监听及清除选中数据
    bindToolsTodo(handler) {
        let todoListElem = this.getElement({ selector: '.todo-list', document: this.app }) //数据列表
        let todoToolsListElem = this.getElement({ selector: '.filters', document: this.app }) //筛选栏列表
        let clearCompleted = this.getElement({ selector: '.clear-completed', document: this.app })  //清空按钮
        todoToolsListElem.addEventListener('click', event => {
            if (event.target.tagName.toLowerCase() == "a") {
                switch (event.target.innerText.toLowerCase()) {
                    case "all":
                        for (var item in todoToolsListElem.getElementsByTagName("li")) {
                            try {
                                todoToolsListElem.getElementsByTagName("li")[item].getElementsByTagName("a")[0].className = "";
                            } catch (error) { }
                        }
                        event.target.className = "selected";
                        todoListElem.childNodes.forEach(item => {
                            item.style.display = "block";
                        })
                        break;
                    case "active":
                        for (var item in todoToolsListElem.getElementsByTagName("li")) {
                            try {
                                todoToolsListElem.getElementsByTagName("li")[item].getElementsByTagName("a")[0].className = "";
                            } catch (error) { }
                        }
                        event.target.className = "selected";
                        todoListElem.childNodes.forEach(item => {
                            let checkbox = this.getElement({ selector: '.toggle', document: item })
                            if (checkbox.checked) {
                                item.style.display = "none";
                            } else {
                                item.style.display = "block";
                            }

                        })
                        break;
                    case "completed":
                        for (var item in todoToolsListElem.getElementsByTagName("li")) {
                            try {
                                todoToolsListElem.getElementsByTagName("li")[item].getElementsByTagName("a")[0].className = "";
                            } catch (error) { }
                        }
                        event.target.className = "selected";
                        todoListElem.childNodes.forEach(item => {
                            let checkbox = this.getElement({ selector: '.toggle', document: item })
                            if (checkbox.checked) {
                                item.style.display = "block";
                            } else {
                                item.style.display = "none";
                            }
                        })
                        break;
                    default: //
                        break;
                }
            }
        })
        clearCompleted.addEventListener('click', event => {
            handler();
        })
    }


    // 解析渲染UI
    initializeView() {
        var div = document.createElement('div');
        div.innerHTML = this.render();
        while (div.children.length > 0) {
            this.app.appendChild(div.children[0]);
        };
    }

    //UI标签(使用es6模板语法排除符号等不必要冲突)
    render() {
        return (` 
            <div>
                <section class="todoapp">
                    <header class="header">
                        <h1>todos</h1>
                        <input class="new-todo" placeholder="What needs to be done?" autofocus>
                    </header>    
                    <!-- This section should be hidden by default and shown when there are todos -->
                    <section class="main">
                        <input id="toggle-all" class="toggle-all" type="checkbox">
                        <label for="toggle-all">Mark all as complete</label>
                        <ul class="todo-list">
                            <!-- These are here just to show the structure of the list items -->
                            <!-- List items should get the class 'editing' when editing and 'completed' when marked as completed -->
                            
                        </ul>    
                    </section>    
                    <!-- This footer should hidden by default and shown when there are todos -->
                    <footer class="footer" style="display:none;">
                        <!-- This should be ‘0 items’ left by default -->
                        <span class="todo-count"><strong>0</strong> item left</span>
                        <!-- Remove this if you don't implement routing -->
                        <ul class="filters">
                            <li>
                                <a class="selected" href="#/">All</a>
                            </li>    
                            <li>
                                <a href="#/active">Active</a>
                            </li>    
                            <li>
                                <a href="#/completed">Completed</a>
                            </li>    
                        </ul>    
                        <!-- Hidden if no completed items are left ↓ -->
                        <button class="clear-completed" style="display:none;">Clear completed</button>
                    </footer>    
                </section>    
                <footer class="info">
                    <p>Double-click to edit a todo</p>
                    <!-- Remove the below line ↓ -->
                    <p>Template by <a href="http://sindresorhus.com">Sindre Sorhus</a></p>
                    <!-- Change this out with your name and url ↓ -->
                    <p>Created by <a href="http://todomvc.com">you</a></p>
                    <p>Part of <a href="http://todomvc.com">TodoMVC</a></p>
                </footer>    
            </div>    
        `);
    }




}

/**
 * @class {控制器} Controller
 * Controller 完成业务逻辑后，要求 Model 改变状态
 * @param {模型} model
 * @param {视图} view
 */
class Control {
    constructor(model, view) {
        //super(model, view)  //当存在继承(extends XXX)组件时,在constructor中使用到this,必须在使用this之前调用super()
        this.model = model
        this.view = view
        // 触发显示绑定(去模型里面拿到数据通过控制器再传给视图，视图再根据数据进行UI渲染)
        this.model.bindTodoListChanged(this.onTodoListChanged)
        this.view.bindAddTodo(this.handleAddTodo)
        this.view.bindEditTodo(this.handleEditTodo)
        this.view.bindDeleteTodo(this.handleDeleteTodo)
        this.view.bindAllCheckTodo(this.handleAllCheckTodo)
        this.view.bindToggleTodo(this.handleToggleTodo)
        this.view.bindToolsTodo(this.handleClearComped)


        // Display initial todos
        this.onTodoListChanged(this.model.todos)

        //初始化
    }

    onTodoListChanged = todos => {
        this.view.displayTodos(todos)
    }

    handleAddTodo = todoName => {
        this.model.addTodo(todoName)
    }

    handleEditTodo = (id, todoName) => {
        this.model.editTodo(id, todoName)
    }

    handleDeleteTodo = id => {
        this.model.deleteTodo(id)
    }

    handleAllCheckTodo = param => {
        this.model.allCheckTodo(param)
    }

    handleToggleTodo = id => {
        this.model.toggleTodo(id)
    }

    handleClearComped = () => {
        this.model.clearComped()
    }


}


//初始化app
const App = new Control(new Model(), new View())