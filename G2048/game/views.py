from django.shortcuts import render
from login.models import Member

def game(request) :
    member = Member.objects.get(user = request.user)
    if member.best_time == -1 :
        time = 'NA'
    else:
        time = member.best_time
    context = {
        'member' : member,
        'time' : time
    }
    return render(request , "game/game.html" , context)