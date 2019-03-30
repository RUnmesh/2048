from django.shortcuts import render , redirect
from django.contrib.auth import login , logout , authenticate
from django.contrib.auth.models import User
from .models import Member
from django.contrib import messages
from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt

def signin(request) :
    username = request.POST.get("username")
    password = request.POST.get('password')
    user = authenticate(username = username , password = password)
    if user :
        login(request , user)
        return redirect("game")
    else :
        messages.error(request , "Invalid credentials")
        return redirect("index")

def signup(request):
    username = request.POST.get("username" , None)
    password = request.POST.get('password' , None)
    if username and password :
        user = User.objects.create_user(username = username , password = password)
        user.save()
        member = Member(user = user)
        login(request , user)
        return redirect("game")
    else :
        return redirect("index")

def index(request) :
    if request.method == "POST" :
        form_id = request.POST.get('form_id')
        if form_id == 0 :
            return signin(request)
        elif form_id == 1:
            return signup(request)
    return render(request , "login/index.html")

@csrf_exempt
def check(request):
    username = request.POST.get("username")
    user = User.objects.filter(username = username)
    if user :
        data = {'res' : '0'}
    else :
        data = {'res' : '1'}
    return JsonResponse(data)


