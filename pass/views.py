import json
from django.contrib.auth import authenticate, login, logout
from django.contrib.auth.decorators import login_required
from django.db import IntegrityError
from django.http import JsonResponse
from django.shortcuts import HttpResponseRedirect, render
from django.urls import reverse
from django.views.decorators.csrf import csrf_exempt

from .models import *

@login_required(login_url="login")
def index(request):
    return render(request, "pass/index.html")

def register(request):
    if request.method == "POST":
        email = request.POST["email"]
        
        password = request.POST["password"]
        confirmation = request.POST["confirmation"]
        if password != confirmation:
            return render(request, "pass/register.html", {
                "message": "Passwords must match."
            })
            
        try:
            user = User.objects.create_user(email, email, password)
            user.save()
        except IntegrityError as e:
            print(e)
            return render(request, "pass/register.html", {
                "message": "Email address already taken."
            })
        login(request, user)
        return HttpResponseRedirect(reverse("index"))
    else:
        return render(request, "pass/register.html")


def login_view(request):
    if request.method == "POST":
        
        email = request.POST["email"]
        password = request.POST["password"]
        user = authenticate(request, username=email, password=password)
        
        if user is not None:
            login(request, user)
            return HttpResponseRedirect(reverse("index"))
        else:
            return render(request, "pass/login.html", {
                "message": "Invalid email and/or password."
            })
    else:
        return render(request, "pass/login.html")

def logout_view(request):
    logout(request)
    return HttpResponseRedirect(reverse("index"))
    

@csrf_exempt
@login_required(login_url="login")
def accesses(request):
    accesses = Access.objects.filter(user=request.user)
    return JsonResponse([access.serialize() for access in accesses], safe=False)

@csrf_exempt
@login_required(login_url="login")
def access(request, access_id=None):
    if access_id == None:
        if request.method != "POST":
            return JsonResponse({"message": "POST request required."})
    
        data = json.loads(request.body)

        try:
            access = Access(
                user=request.user, 
                site=data.get("site"), 
                username=data.get("username"), 
                password=data.get("password")
            )
            access.save()
            return JsonResponse({"message": "Password added successfully."})
        except:
            return JsonResponse({"message": "Error adding password."})

    try:
        access = Access.objects.get(user=request.user, pk=access_id)
    except Access.DoesNotExist:
        return JsonResponse({"message": "Password not found."})

    if request.method == "GET":
        return JsonResponse(access.serialize())
    
    elif request.method == "PUT":
        data = json.loads(request.body)
        try:
            access.site=data.get("site")
            access.username=data.get("username") 
            access.password=data.get("password")
            access.save()
            return JsonResponse({"message": "Password updated successfully."})
        except:
            return JsonResponse({"message": "Error updating password."})
    
    elif request.method == "DELETE":
        try:
            access.delete()
            return JsonResponse({"message": "Password deleted successfully."})
        except:
            return JsonResponse({"message": "Error deleting password."})

    else:
        return JsonResponse({"message": "Invalid request method."})

