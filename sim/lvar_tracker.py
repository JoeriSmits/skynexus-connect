from time import sleep

def register_lvar(vr, var):
    vr.get(var)
    sleep(0.2)

def get_lvar(vr, var):
    return vr.get(var)
