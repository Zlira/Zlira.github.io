---
layout: post
title:  "Паттерн прототип"
date:   2014-10-04 14:06:32
---

Оце я думала, що паттерни (чи то шаблони проектування), це щось дуже складне, а виялвяється не завжди. Мені треба розповідати про
паттерн прототип у пайтоні, я прочитала [оце](http://www.informit.com/articles/article.aspx?p=2131418&seqNum=4) і подумала «How incredibly... LAME!»
А на стековерфлов, наприклад, пишуть:

> The reason you use it instead of subclassing is that it allows for duck-typing and multiple inheritance
> on platforms that don't natively support such things.

Пайтон підтимує such things, тому який зміст? А про js окрема історія. Ну, але як треба, то треба.

##Коротка суть
така: є об'єкт, його клонують, внаслідок чого виникає новий об'єкт з таким же станом, пізніше кожен з об'єктів може піти собі своєю дорогою,
тобто змінювати стан, як йому заманеться.

##Навіщо?
[Джавісти](https://stackoverflow.com/questions/5739240/questions-about-the-prototype-pattern), наприклад, використовують його,
коли класи, які треба інстанціювати визначаються динамічно. Знову ж таки у пайтоні для цього не кочне використовувати який-небуть шаблон можна
зробити якось інакше. Приклад з точкою:
{% highlight python %}
class Point(object):

    __slots__ = ("x", "y")

    def __init__(self, x, y):
        self.x = x
        self.y = y

p1 = Point(1, 2)
{% endhighlight %}

Тепер додамо ще точок різними методами:
{% highlight python %}
point2 = getattr(sys.modules[__name__], "Point")(3, 6)

point3 = globals()["Point"](4, 8)

point4 = point1.__class__(7, 14)

def make_object(Class, *args, **kwargs):
    return Class(*args, **kwargs)

point5 = make_object(Point, 5, 10)
{% endhighlight %}

Всі наведені способи добре підходять для створення об'єктів, коли клас не відомо наперед, але жоден із них не створює новий об'єкт за зразком
старого. А ось метод щоб так і зробити:
{% highlight python %}
point6 = copy.deepcopy(point1)
{% endhighlight %}
Та-дам! ось і по прототипу. Ну ще його треба красиво огорнути в метод і все таке.

Наступний випадок, в якому джавісти і інші таке використовують, це коли в об'єкта може бути тільки обмежена кількість комбінацій станів. І такому 
випадку може виявитись зручніше стоврити прототип на кожну комбінацію і клонувати його, ніж постійно створювати нові об'єкти з нуля. І тут
приходить біологічний приклад про мітоз. Найкраще про мітоз в специфічній імунній системі. І я вже відчуваю, як аналогія може зайти надто далеко,
тому повернусь до коду, а там, як залишиться час напишу нудний класний приклад.

Також він корисний, коли треба уникнути вибудовування складної ієрархії класів чи фабрик.

Як переваги значиться щось про те, що клонувати об'єкт - дешевше процедура, ніж стоврити новий через `new`, що не знаю, чи факт про пайтон.

##Діаграма

![Prototype UML-diagram](https://upload.wikimedia.org/wikipedia/commons/a/af/Prototype_design_pattern.png)

Досить ясна діаграма без додаткових слів, по-моєму.

##Приклади
[Отут](https://github.com/faif/python-patterns/blob/master/prototype.py) більш-менш серйозний приклад, який не відоповідає наведеній вище
діаграмі. Щоб їй відповідати треба просто у клас, інстанси, якого будуть використовуватись як прототипи дописати якийсь такий мотод:
{% highlight python %}
def clone(self):
    return copy.deepcopy(self)
{% endhighlight %}
Ну, можна там ще оновити атрибути, як у першому випадку.

І ще одна річ, чому `copy.deepcopy()`, а не `copy.copy()`. Для демонстрування клас точечки треба трошки погіршити:
{% highlight python %}
class Point2(object):

    __slots__ = ('coord')

    def __init__(self, x, y):
        self.coord = [x, y]

{% endhighlight %}
Тепер ось так:
{% highlight python %}
>>> p1 = Point2(3, 4)
>>> p1.coord
[3, 4]

>>> p2 = copy.copy(p1)
>>> p2.coord
[3, 4]

>>> p2.coord[0] = 18
>>> p1.coord
[18, 4]

>>> p3 = copy.deepcopy(p1)
>>> p3.coord
[18, 4]

>>> p3.coord[0] = 23
>>> p1.coord
[18, 4]
{% endhighlight %}

##Окерма історія про js
У js взагалі все успадкування базується на прототипах, так що це якась чисто вроджена риса мови. [Кажуть](https://carldanley.com/js-prototype-pattern/),
що гарна перевага цього в тому, що дітки успадковують тікльи посилання на певні функції, і пам'ять не засмічується цілою кучею однакових
функцій.

Приклад #1, здертий [звідти](https://carldanley.com/js-prototype-pattern/):
{% highlight javascript %}
// build our blueprint object
var MyBluePrint = function MyBluePrintObject() {
this.someFunction = function someFunction() {
alert( 'some function' );
};
this.someOtherFunction = function someOtherFunction() {
alert( 'some other function' );
};
this.showMyName = function showMyName() {
alert( this.name );
};
};
 
function MyObject() {
this.name = 'testing';
}
MyObject.prototype = new MyBluePrint();
 
// example usage
var testObject = new MyObject();
testObject.someFunction(); // alerts "some function"
testObject.someOtherFunction(); // alerts "some other function"
testObject.showMyName(); // alerts "testing"
{% endhighlight %}

Приклад #2. Здертий [звідти](http://addyosmani.com/resources/essentialjsdesignpatterns/book/#prototypepatternjavascript):
{% highlight javascript %}
var myCar = {
 
  name: "Ford Escort",
 
  drive: function () {
    console.log( "Weeee. I'm driving!" );
  },
 
  panic: function () {
    console.log( "Wait. How do you stop this thing?" );
  }
 
};
 
// Use Object.create to instantiate a new car
var yourCar = Object.create( myCar );
 
// Now we can see that one is a prototype of the other
console.log( yourCar.name );
{% endhighlight %}

І ще один трохи завернутіший приклад #3 звідти ж:
{% highlight javascript %}
var beget = (function () {
 
    function F() {}
 
    return function ( proto ) {
        F.prototype = proto;
        return new F();
    };
})();

> var cat = {
     name: 'Solpavchek',
     state: 'grumpy',
     meow: function () {
         console.log('Meow! meow!');
     }
 };
undefined
> cat.name;
"Solpavchek"
> var other_cat = beget(cat);
undefined
> other_cat.name
"Solpavchek"
> other_cat.meow();
"Meow! meow!"
{% endhighlight %}
Але це якесь збочення, бо потреби так робити немає.
