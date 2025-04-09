import logging
from time import sleep
from sim.sim_connect import get_mobiflight_interface
from sim.lvar_tracker import register_lvar, get_lvar
from sim.lvar_control import set_lvar

def setup_logging():
    log_format = "%(asctime)s [%(levelname)-5s] %(message)s"
    logging.basicConfig(level=logging.INFO, format=log_format)

def main():
    setup_logging()

    vr = get_mobiflight_interface()

    var = "L:var_engineDamage_L"
    new_value = 42

    print(f"🔄 Registering {var}...")
    register_lvar(vr, var)
    initial = get_lvar(vr, var)
    print(f"📊 Before: {initial}")

    set_lvar(vr, var, new_value)
    sleep(0.3)

    updated = get_lvar(vr, var)
    print(f"✅ After:  {updated}")

if __name__ == "__main__":
    main()
