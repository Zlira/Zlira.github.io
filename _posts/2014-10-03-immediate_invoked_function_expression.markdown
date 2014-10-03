---
layout: post
title:  "Immediately-Invoked Function Expression"
date:   2014-10-04 12:37:32
---

Тепер про дещо приємніші речі в жабоскрипті. Наприклад, посписую з бложиків інших людей про
immediately invoked function expressions і паттерн модуль. Спершу про перше.

Значить, є дві окремі штуки: декларація функції [fucntion declaration](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Statements/function):
{% highlight javascript %}
function test() {};
{% endhighlight %}
і функційний вираз [function expression](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Operators/function):
{% highlight javascript %}
var test = function() {};
{% endhighlight %}
Різниця між ними в тому, що у функційному виразі можна не вказувати імені функції, тобто вона може бути анонімною і ще таку
функцію можна виконати відразу, що нам і потрібно.

Якщо почати рядочок із `function`, то інтерпретатор зрозуміє це як декларацію, тому, якщо хочеться вираз, треба взяти це
все діло в дужечки. Тако:

{% highlight javascript %}
> (function (smth) {
      console.log(smth);
  })('Hi!');
"Hi!"
{% endhighlight %}

Але можна і без дужечок обійтись, якщо інтерпертатор і так очікує виразу:
{% highlight javascript %}
> var i = function(){ return 10; }();
undefined
> i;
10
{% endhighlight %}

Хоча [пишуть](http://benalman.com/news/2010/11/immediately-invoked-function-expression/), що не слід так робити, бо
дужечки відразу попереджують того, хто читає код, що змінній буде присвоєне значення виконання функції, а не сама функція.

Ці от IIFE або iffy можна використовувати для того, щоб зберегти стан. Приклади знову [звідси](http://benalman.com/news/2010/11/immediately-invoked-function-expression/).
От хочеться комусь, щоб при кожному кліку на посилання виводився його порядковий номер, то цей хтось може написати щось таке:
{% highlight javascript%}
var links = document.getElementsByTagName( 'a' );

for ( var i = 0; i < elems.links; i++ ) {
  links[ i ].addEventListener( 'click', function(e){
    e.preventDefault();
    alert( 'I am link #' + i );
  }, 'false' );
}
{% endhighlight %}
І чим це обренеться? Це обернеться тим, що кожна лінка покаже нам 4, тому що `i` після виконання цього всього коду буде рівне
чотирьом. Що робити? Можна використати iffy:
{% highlight javascript %}
var links = document.getElementsByTagName( 'a' );

for ( var i = 0; i < links.length; i++ ) {
  (function( lockedInIndex ){
   links[ i ].addEventListener( 'click', function(e){
      e.preventDefault();
      alert( 'I am link #' + lockedInIndex );
    }, 'false' );
  })( i );
}
{% endhighlight %}
І це буде працювати, як передбачалось, тому що значення `i` в кожній ітерації зберігається як аргумент у функції.

Крім того, звичайно ж, IIFE корисні для того, щоб обмежити доступ до змінних, помістивши їх в окремий простір.
[Тут-во](http://gregfranko.com/blog/i-love-my-iife/) пише, що так роблять усі серйозні люди із jQuery, Backbone.js, 
Modernizr тощо.

Там же ж пишуть і про інші iffy переваги, хоча, по-моєму, вони не такі суттєві. Наприклад, можна пришвидшити пошук
глобальних змінних, якщо передати їх аргументами iffy, бо js буде дивитсь спершу в локальному просторі, знайде їх і
не полізе далі, що добре для швидкодії:
{% highlight javascript %}
function(window, document, $) {
  // You can now reference the window, document, and jQuery objects in a local scope
}(window, document, window.jQuery);
{% endhighlight %}

В тому ж прикладі можна передати аргументами `w` і `d` замість `window` і `document`, і так буде менше символів пистаи,
але не знаю, чи це така вже добра ідея.

Ну, і нарешті, iffy можна використовувати для створення паттерну Module. І я напишу про нього у наступному пості.
