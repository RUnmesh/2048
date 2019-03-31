from django.shortcuts import render
from login.models import Member
from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt

def game(request) :
    member = Member.objects.get(user = request.user)
    context = {
        'member' : member,
    }
    return render(request , "game/game.html" , context)

@csrf_exempt
def updatescore(request) :
    member = Member.objects.get(user = request.user)
    score = int(request.POST.get("score"))
    if score > member.best_score :
        member.best_score = score
    member.games += 1
    member.save()
    data = {
        'score' : member.best_score ,
        'games' : member.games
    }
    return JsonResponse(data)
